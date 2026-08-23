import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schemas";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest } from "../../shared/middleware/auth.middleware";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await AuthService.register(validationResult.data);

      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
      res.cookie("accessToken", result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: result,
      });
    } catch (error: any) {
      const message = error.message || "Registration failed";
      const statusCode = message === "Email already exists" ? 400 : 400;
      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await AuthService.login(validationResult.data);

      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
      res.cookie("accessToken", result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Invalid credentials",
      });
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: "Missing authentication",
        });
        return;
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
      res.cookie("accessToken", result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Invalid token",
      });
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }

  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Missing authentication" });
        return;
      }

      const data = await AuthService.getUserById(req.user.userId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || "User not found",
      });
    }
  }
}
