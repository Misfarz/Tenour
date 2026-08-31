import { Router } from "express";
import { authenticate } from "../../../shared/middleware/auth.middleware";
import { tenantContext } from "../../../shared/middleware/tenant.middleware";
import { requireRole } from "../../../shared/middleware/rbac.middleware";
import { BuyerRole } from "../../../shared/constants/roles";
import { QuotationController } from "../../../modules/quotations/quotation.controller";

// Vendor Quotation Router
export const vendorQuotationRouter = Router();

vendorQuotationRouter.use(authenticate);

vendorQuotationRouter.post("/", QuotationController.createVendorQuotation);
vendorQuotationRouter.get("/", QuotationController.getVendorQuotations);
vendorQuotationRouter.get("/:id", QuotationController.getVendorQuotationById);
vendorQuotationRouter.patch("/:id", QuotationController.updateVendorDraftQuotation);
vendorQuotationRouter.post("/:id/submit", QuotationController.submitVendorQuotation);
vendorQuotationRouter.post("/:id/withdraw", QuotationController.withdrawVendorQuotation);

// Buyer Quotation Router
export const buyerQuotationRouter = Router();

buyerQuotationRouter.use(authenticate, tenantContext);

buyerQuotationRouter.get(
  "/",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  QuotationController.getBuyerQuotations
);

buyerQuotationRouter.get(
  "/:id",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  QuotationController.getBuyerQuotationById
);

buyerQuotationRouter.post(
  "/:id/select",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  QuotationController.selectWinningQuotation
);

// RFQ Quotations & Comparison Router (for RFQ-scoped endpoints)
export const rfqQuotationsRouter = Router();

rfqQuotationsRouter.use(authenticate, tenantContext);

rfqQuotationsRouter.get(
  "/:id/quotations",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  QuotationController.getRfqComparison
);

rfqQuotationsRouter.get(
  "/:id/compare",
  requireRole(BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT),
  QuotationController.getRfqComparison
);
