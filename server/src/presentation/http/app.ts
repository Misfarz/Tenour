import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import organizationRoutes from "./routes/organization.routes";
import purchaseRequestRoutes from "./routes/purchase-request.routes";
import vendorRoutes from "./routes/vendor.routes";

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

  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Tenour API is running",
    });
  });

  return app;
};