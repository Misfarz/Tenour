import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schemas";
import { RegisterUserUseCase } from "./use-cases/register-user.use-case";
import { LoginUserUseCase } from "./use-cases/login-user.use-case";
import { RefreshTokenUseCase } from "./use-cases/refresh-token.use-case";
import { GetCurrentUserUseCase } from "./use-cases/get-current-user.use-case";
import { VerifyInvitationUseCase } from "./use-cases/verify-invitation.use-case";
import { AcceptInvitationUseCase } from "./use-cases/accept-invitation.use-case";
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

      const result = await RegisterUserUseCase.execute(validationResult.data);

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
      res.status(400).json({
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

      const result = await LoginUserUseCase.execute(validationResult.data);

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

      const result = await RefreshTokenUseCase.execute(refreshToken);

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
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.clearCookie("accessToken", COOKIE_OPTIONS);
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

      const data = await GetCurrentUserUseCase.execute(req.user.userId);

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

  static async verifyInvitation(req: Request, res: Response): Promise<void> {
    try {
      const token = (req.query.token as string) || req.body?.token;
      const data = await VerifyInvitationUseCase.execute(token);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Invalid invitation token",
      });
    }
  }

  static async acceptInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      const data = await AcceptInvitationUseCase.execute(token, password);

      res.status(200).json({
        success: true,
        message: "Invitation accepted successfully. Account is now active.",
        data,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to accept invitation",
      });
    }
  }
}
