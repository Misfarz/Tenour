import { Router } from "express";
import { authenticate } from "../../../shared/middleware/auth.middleware";
import { tenantContext, vendorContext } from "../../../shared/middleware/tenant.middleware";
import { requireRole } from "../../../shared/middleware/rbac.middleware";
import { BuyerRole } from "../../../shared/constants/roles";
import { PurchaseOrderController } from "../../../modules/purchase-orders/purchase-order.controller";

// Buyer Purchase Order Router
export const buyerPurchaseOrderRouter = Router();

buyerPurchaseOrderRouter.use(authenticate, tenantContext);

buyerPurchaseOrderRouter.post(
  "/",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  PurchaseOrderController.createBuyerPurchaseOrder
);

buyerPurchaseOrderRouter.get(
  "/",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  PurchaseOrderController.getBuyerPurchaseOrders
);

buyerPurchaseOrderRouter.get(
  "/:id",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  PurchaseOrderController.getBuyerPurchaseOrderById
);

buyerPurchaseOrderRouter.patch(
  "/:id",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  PurchaseOrderController.updateBuyerDraftPurchaseOrder
);

buyerPurchaseOrderRouter.post(
  "/:id/send",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  PurchaseOrderController.sendBuyerPurchaseOrder
);

buyerPurchaseOrderRouter.post(
  "/:id/cancel",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  PurchaseOrderController.cancelBuyerPurchaseOrder
);

// Vendor Purchase Order Router
export const vendorPurchaseOrderRouter = Router();

vendorPurchaseOrderRouter.use(authenticate, vendorContext);

vendorPurchaseOrderRouter.get("/", PurchaseOrderController.getVendorPurchaseOrders);
vendorPurchaseOrderRouter.get("/:id", PurchaseOrderController.getVendorPurchaseOrderById);
vendorPurchaseOrderRouter.post("/:id/acknowledge", PurchaseOrderController.acknowledgeVendorPurchaseOrder);
vendorPurchaseOrderRouter.post("/:id/reject", PurchaseOrderController.rejectVendorPurchaseOrder);
