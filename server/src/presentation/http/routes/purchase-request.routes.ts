import { Router } from "express";
import { authenticate } from "../../../shared/middleware/auth.middleware";
import { tenantContext } from "../../../shared/middleware/tenant.middleware";
import { PurchaseRequestController } from "../../../modules/purchase-requests/purchase-request.controller";

const router = Router();

router.use(authenticate, tenantContext);

router.post("/", PurchaseRequestController.createRequest);
router.get("/", PurchaseRequestController.getRequests);
router.get("/:id", PurchaseRequestController.getRequestById);
router.patch("/:id", PurchaseRequestController.updateRequest);
router.delete("/:id", PurchaseRequestController.deleteRequest);
router.post("/:id/submit", PurchaseRequestController.submitRequest);

export default router;
