import { Response } from "express";
import { AuthenticatedTenantRequest } from "../../../shared/middleware/tenant.middleware";
import { GetOrgUsersUseCase } from "./use-cases/get-org-users.use-case";
import { AddOrgUserUseCase } from "./use-cases/add-org-user.use-case";
import { UpdateOrgUserRoleUseCase } from "./use-cases/update-org-user-role.use-case";
import { UpdateOrgUserStatusUseCase } from "./use-cases/update-org-user-status.use-case";
import {
  addOrgUserSchema,
  updateOrgUserRoleSchema,
  updateOrgUserStatusSchema,
} from "./org-users.schemas";

export class OrgUsersController {
  static async getUsers(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const data = await GetOrgUsersUseCase.execute(organizationId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch organization users",
      });
    }
  }

  static async addUser(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;

      const validationResult = addOrgUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await AddOrgUserUseCase.execute(organizationId, validationResult.data);

      res.status(201).json({
        success: true,
        message: "User added successfully to organization",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add user to organization",
      });
    }
  }

  static async updateRole(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = updateOrgUserRoleSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await UpdateOrgUserRoleUseCase.execute(
        organizationId,
        targetId,
        validationResult.data
      );

      res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message === "User not found in your organization" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update user role",
      });
    }
  }

  static async updateStatus(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const targetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = updateOrgUserStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await UpdateOrgUserStatusUseCase.execute(
        organizationId,
        targetId,
        validationResult.data
      );

      res.status(200).json({
        success: true,
        message: "User status updated successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message === "User not found in your organization" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update user status",
      });
    }
  }
}
