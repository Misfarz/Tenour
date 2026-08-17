import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";

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

  app.use("/api/v1/auth", authRoutes);

  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Tenour API is running",
    });
  });

  return app;
};