import { Response } from "express";
import { createOrganizationSchema } from "./organization.schemas";
import { OrganizationService } from "./organization.service";
import { AuthenticatedRequest } from "../../shared/middleware/auth.middleware";

export class OrganizationController {
  static async createOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Missing authentication" });
        return;
      }

      const validationResult = createOrganizationSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Organization name missing",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await OrganizationService.createOrganization(
        req.user.userId,
        validationResult.data
      );

      res.status(201).json({
        success: true,
        message: "Organization created successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create organization",
      });
    }
  }
}
