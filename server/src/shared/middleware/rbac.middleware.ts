import { Response, NextFunction } from "express";
import { AuthenticatedTenantRequest } from "./tenant.middleware";
import { ROLE_PERMISSIONS } from "../constants/roles";

export const requireRole = (...allowedRoles: (string | string[])[]) => {
  const roles = allowedRoles.flat();
  return (req: AuthenticatedTenantRequest, res: Response, next: NextFunction): void => {
    if (!req.tenant) {
      res.status(401).json({ success: false, message: "Unauthorized: Missing tenant context" });
      return;
    }

    if (!roles.includes(req.tenant.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions",
      });
      return;
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedTenantRequest, res: Response, next: NextFunction): void => {
    if (!req.tenant) {
      res.status(401).json({ success: false, message: "Unauthorized: Missing tenant context" });
      return;
    }

    const userPermissions = ROLE_PERMISSIONS[req.tenant.role] || [];
    if (!userPermissions.includes(permission)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions",
      });
      return;
    }

    next();
  };
};
