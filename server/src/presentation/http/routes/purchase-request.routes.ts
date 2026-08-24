import { Router } from "express";
import { authenticate } from "../../../shared/middleware/auth.middleware";
import { tenantContext } from "../../../shared/middleware/tenant.middleware";
import { requireRole } from "../../../shared/middleware/rbac.middleware";
import { BuyerRole } from "../../../shared/constants/roles";
import { PurchaseRequestController } from "../../../modules/purchase-requests/purchase-request.controller";

const router = Router();

router.use(authenticate, tenantContext);

// Manager Approval Endpoints (Day 5 - Only MANAGER)
router.get(
  "/pending-approval",
  requireRole(BuyerRole.MANAGER),
  PurchaseRequestController.getPendingApprovals
);
router.post(
  "/:id/approve",
  requireRole(BuyerRole.MANAGER),
  PurchaseRequestController.approveRequest
);
router.post(
  "/:id/reject",
  requireRole(BuyerRole.MANAGER),
  PurchaseRequestController.rejectRequest
);

// Standard Purchase Request Endpoints (Day 4)
router.post("/", PurchaseRequestController.createRequest);
router.get("/", PurchaseRequestController.getRequests);
router.get("/:id", PurchaseRequestController.getRequestById);
router.patch("/:id", PurchaseRequestController.updateRequest);
router.delete("/:id", PurchaseRequestController.deleteRequest);
router.post("/:id/submit", PurchaseRequestController.submitRequest);

export default router;
