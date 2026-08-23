import { Response } from "express";
import { AuthenticatedTenantRequest } from "../../../shared/middleware/tenant.middleware";
import {
  GetOrgSettingsUseCase,
  UpdateOrgSettingsUseCase,
} from "./use-cases/org-settings.use-case";
import { updateOrgSettingsSchema } from "./org-settings.schemas";

export class OrgSettingsController {
  static async getSettings(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const data = await GetOrgSettingsUseCase.execute(organizationId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch organization settings",
      });
    }
  }

  static async updateSettings(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;

      const validationResult = updateOrgSettingsSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await UpdateOrgSettingsUseCase.execute(
        organizationId,
        validationResult.data
      );

      res.status(200).json({
        success: true,
        message: "Organization settings updated successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update organization settings",
      });
    }
  }
}
