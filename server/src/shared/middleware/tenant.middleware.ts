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
