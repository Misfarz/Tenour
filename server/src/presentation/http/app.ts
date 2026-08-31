import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import organizationRoutes from "./routes/organization.routes";
import purchaseRequestRoutes from "./routes/purchase-request.routes";
import vendorRoutes from "./routes/vendor.routes";
import { buyerRfqRouter, vendorRfqRouter } from "./routes/rfq.routes";
import {
  vendorQuotationRouter,
  buyerQuotationRouter,
  rfqQuotationsRouter,
} from "./routes/quotation.routes";
import {
  buyerPurchaseOrderRouter,
  vendorPurchaseOrderRouter,
} from "./routes/purchase-order.routes";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Support both /auth and /api/v1/auth
  app.use("/auth", authRoutes);
  app.use("/api/v1/auth", authRoutes);

  // Support both /organizations and /api/v1/organizations
  app.use("/organizations", organizationRoutes);
  app.use("/api/v1/organizations", organizationRoutes);

  // Purchase Requests
  app.use("/purchase-requests", purchaseRequestRoutes);
  app.use("/api/v1/purchase-requests", purchaseRequestRoutes);

  // Vendors
  app.use("/vendors", vendorRoutes);
  app.use("/api/v1/vendors", vendorRoutes);

  // Quotations (Vendor)
  app.use("/vendor/quotations", vendorQuotationRouter);
  app.use("/api/v1/vendor/quotations", vendorQuotationRouter);

  // Quotations (Buyer)
  app.use("/quotations", buyerQuotationRouter);
  app.use("/api/v1/quotations", buyerQuotationRouter);

  // Purchase Orders (Buyer)
  app.use("/purchase-orders", buyerPurchaseOrderRouter);
  app.use("/api/v1/purchase-orders", buyerPurchaseOrderRouter);

  // Purchase Orders (Vendor)
  app.use("/vendor/purchase-orders", vendorPurchaseOrderRouter);
  app.use("/api/v1/vendor/purchase-orders", vendorPurchaseOrderRouter);

  // RFQs (Buyer - Quotation comparison routes mounted before general RFQ router)
  app.use("/rfqs", rfqQuotationsRouter);
  app.use("/api/v1/rfqs", rfqQuotationsRouter);

  // RFQs (Buyer)
  app.use("/rfqs", buyerRfqRouter);
  app.use("/api/v1/rfqs", buyerRfqRouter);

  // RFQs (Vendor)
  app.use("/vendor/rfqs", vendorRfqRouter);
  app.use("/api/v1/vendor/rfqs", vendorRfqRouter);

  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Tenour API is running",
    });
  });

  return app;
};