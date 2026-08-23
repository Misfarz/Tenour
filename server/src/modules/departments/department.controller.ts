import { Response } from "express";
import { AuthenticatedTenantRequest } from "../../shared/middleware/tenant.middleware";
import { GetDepartmentsUseCase } from "./use-cases/get-departments.use-case";
import { CreateDepartmentUseCase } from "./use-cases/create-department.use-case";
import { UpdateDepartmentUseCase } from "./use-cases/update-department.use-case";
import { DeleteDepartmentUseCase } from "./use-cases/delete-department.use-case";
import { createDepartmentSchema, updateDepartmentSchema } from "./department.schemas";

export class DepartmentController {
  static async getDepartments(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const data = await GetDepartmentsUseCase.execute(organizationId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch departments",
      });
    }
  }

  static async createDepartment(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;

      const validationResult = createDepartmentSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await CreateDepartmentUseCase.execute(organizationId, validationResult.data);

      res.status(201).json({
        success: true,
        message: "Department created successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create department",
      });
    }
  }

  static async updateDepartment(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const departmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = updateDepartmentSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await UpdateDepartmentUseCase.execute(
        organizationId,
        departmentId,
        validationResult.data
      );

      res.status(200).json({
        success: true,
        message: "Department updated successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message === "Department not found in your organization" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update department",
      });
    }
  }

  static async deleteDepartment(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const departmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await DeleteDepartmentUseCase.execute(organizationId, departmentId);

      res.status(200).json({
        success: true,
        message: "Department deleted successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message === "Department not found in your organization" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to delete department",
      });
    }
  }
}
