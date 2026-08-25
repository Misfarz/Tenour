import { Router } from "express";
import { authenticate } from "../../../shared/middleware/auth.middleware";
import { tenantContext } from "../../../shared/middleware/tenant.middleware";
import { requireRole } from "../../../shared/middleware/rbac.middleware";
import { BuyerRole } from "../../../shared/constants/roles";
import { VendorController } from "../../../modules/vendors/vendor.controller";

const router = Router();

router.use(authenticate, tenantContext);

// POST /vendors (Only ORG_ADMIN and PROCUREMENT)
router.post(
  "/",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  VendorController.createVendor
);

export default router;
