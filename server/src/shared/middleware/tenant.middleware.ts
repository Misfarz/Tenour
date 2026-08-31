import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { prisma } from "../../infrastructure/database/prisma/prisma.client";

export interface TenantContext {
  organizationId: string;
  organizationName: string;
  memberId: string;
  role: string;
  status: string;
  departmentId?: string | null;
}

export interface AuthenticatedTenantRequest extends AuthenticatedRequest {
  tenant?: TenantContext;
}

export const tenantContext = async (
  req: AuthenticatedTenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized: Missing authentication" });
      return;
    }

    const member = await prisma.organizationMember.findFirst({
      where: { userId: req.user.userId },
      include: {
        organization: true,
        role: true,
      },
    });

    if (!member) {
      res.status(403).json({
        success: false,
        message: "Forbidden: User does not belong to any organization",
      });
      return;
    }

    if (member.status !== "ACTIVE") {
      res.status(403).json({
        success: false,
        message: "Forbidden: Account is inactive in this organization",
      });
      return;
    }

    req.tenant = {
      organizationId: member.organizationId,
      organizationName: member.organization.name,
      memberId: member.id,
      role: member.role.name,
      status: member.status,
      departmentId: member.departmentId,
    };

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error resolving organization context",
    });
  }
};

export interface VendorContext {
  vendorId: string;
  vendorName: string;
  role: string;
}

export interface AuthenticatedVendorRequest extends AuthenticatedRequest {
  vendorContext?: VendorContext;
}

export const vendorContext = async (
  req: AuthenticatedVendorRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized: Missing authentication" });
      return;
    }

    let vendorId = (req.user as any)?.vendorId;
    let vendorName = "";
    let role = (req.user as any)?.role || "VENDOR_ADMIN";

    if (!vendorId) {
      const vendorUser = await prisma.vendorUser.findUnique({
        where: { userId: req.user.userId },
        include: { vendor: true },
      });

      if (!vendorUser) {
        res.status(403).json({
          success: false,
          message: "Forbidden: Vendor authentication required",
        });
        return;
      }

      vendorId = vendorUser.vendorId;
      vendorName = vendorUser.vendor.name;
      role = vendorUser.role;
    }

    (req.user as any).vendorId = vendorId;
    req.vendorContext = {
      vendorId,
      vendorName,
      role,
    };

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error resolving vendor context",
    });
  }
};
