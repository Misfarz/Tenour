import { Router } from "express";
import { OrganizationController } from "../../../modules/organizations/organization.controller";
import { OrgUsersController } from "../../../modules/organizations/users/org-users.controller";
import { OrgSettingsController } from "../../../modules/organizations/settings/org-settings.controller";
import { DepartmentController } from "../../../modules/departments/department.controller";
import { authenticate } from "../../../shared/middleware/auth.middleware";
import { tenantContext } from "../../../shared/middleware/tenant.middleware";
import { requireRole } from "../../../shared/middleware/rbac.middleware";
import { BuyerRole } from "../../../shared/constants/roles";

const router = Router();

// Organization Creation (Day 2 Flow)
router.post("/", authenticate, OrganizationController.createOrganization);

// Organization User Management (Day 3 - Only ORG_ADMIN)
router.get(
  "/users",
  authenticate,
  tenantContext,
  requireRole(BuyerRole.ORG_ADMIN),
  OrgUsersController.getUsers
);
router.post(
  "/users",
  authenticate,
  tenantContext,
  requireRole(BuyerRole.ORG_ADMIN),
  OrgUsersController.addUser
);
router.patch(
  "/users/:id/role",
  authenticate,
  tenantContext,
  requireRole(BuyerRole.ORG_ADMIN),
  OrgUsersController.updateRole
);
router.patch(
  "/users/:id/status",
  authenticate,
  tenantContext,
  requireRole(BuyerRole.ORG_ADMIN),
  OrgUsersController.updateStatus
);

// Department Management (Day 3)
router.get("/departments", authenticate, tenantContext, DepartmentController.getDepartments);
router.post(
  "/departments",
  authenticate,
  tenantContext,
  requireRole(BuyerRole.ORG_ADMIN),
  DepartmentController.createDepartment
);
router.patch(
  "/departments/:id",
  authenticate,
  tenantContext,
  requireRole(BuyerRole.ORG_ADMIN),
  DepartmentController.updateDepartment
);
router.delete(
  "/departments/:id",
  authenticate,
  tenantContext,
  requireRole(BuyerRole.ORG_ADMIN),
  DepartmentController.deleteDepartment
);

// Organization Settings (Day 3 - Only ORG_ADMIN)
router.get(
  "/settings",
  authenticate,
  tenantContext,
  requireRole(BuyerRole.ORG_ADMIN),
  OrgSettingsController.getSettings
);
router.patch(
  "/settings",
  authenticate,
  tenantContext,
  requireRole(BuyerRole.ORG_ADMIN),
  OrgSettingsController.updateSettings
);

export default router;
