import { Router } from "express";
import { authenticate } from "../../../shared/middleware/auth.middleware";
import { tenantContext, vendorContext } from "../../../shared/middleware/tenant.middleware";
import { requireRole } from "../../../shared/middleware/rbac.middleware";
import { BuyerRole } from "../../../shared/constants/roles";
import { RfqController } from "../../../modules/rfqs/rfq.controller";

export const buyerRfqRouter = Router();

buyerRfqRouter.use(authenticate, tenantContext);

// RBAC: Only ORG_ADMIN & PROCUREMENT can create, manage, edit, send, and cancel RFQs
buyerRfqRouter.post(
  "/",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  RfqController.createRfq
);

buyerRfqRouter.get(
  "/",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  RfqController.getRfqs
);

buyerRfqRouter.get(
  "/:id",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  RfqController.getRfqById
);

buyerRfqRouter.patch(
  "/:id",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  RfqController.updateRfq
);

buyerRfqRouter.post(
  "/:id/send",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  RfqController.sendRfq
);

buyerRfqRouter.post(
  "/:id/cancel",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  RfqController.cancelRfq
);

// Vendor RFQ Router
export const vendorRfqRouter = Router();

vendorRfqRouter.use(authenticate, vendorContext);

vendorRfqRouter.get("/", RfqController.getVendorRfqs);
vendorRfqRouter.get("/:id", RfqController.getVendorRfqById);
