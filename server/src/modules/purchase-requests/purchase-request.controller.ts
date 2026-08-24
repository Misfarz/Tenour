import { Response } from "express";
import { AuthenticatedTenantRequest } from "../../shared/middleware/tenant.middleware";
import { createPurchaseRequestSchema, updatePurchaseRequestSchema } from "./purchase-request.schemas";
import { CreatePurchaseRequestUseCase } from "./use-cases/create-purchase-request.use-case";
import { GetPurchaseRequestsUseCase } from "./use-cases/get-purchase-requests.use-case";
import { GetPurchaseRequestUseCase } from "./use-cases/get-purchase-request.use-case";
import { UpdatePurchaseRequestUseCase } from "./use-cases/update-purchase-request.use-case";
import { DeletePurchaseRequestUseCase } from "./use-cases/delete-purchase-request.use-case";
import { SubmitPurchaseRequestUseCase } from "./use-cases/submit-purchase-request.use-case";

export class PurchaseRequestController {
  static async createRequest(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const requesterId = req.user!.userId;

      const validationResult = createPurchaseRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await CreatePurchaseRequestUseCase.execute({
        organizationId,
        requesterId,
        input: validationResult.data,
      });

      res.status(201).json({
        success: true,
        message: "Purchase request created successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create purchase request",
      });
    }
  }

  static async getRequests(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.userId;
      const role = req.tenant!.role;

      const data = await GetPurchaseRequestsUseCase.execute({
        organizationId,
        userId,
        role,
      });

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch purchase requests",
      });
    }
  }

  static async getRequestById(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.userId;
      const role = req.tenant!.role;
      const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const data = await GetPurchaseRequestUseCase.execute({
        requestId,
        organizationId,
        userId,
        role,
      });

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      const statusCode = error.message === "Purchase request not found" ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to fetch purchase request",
      });
    }
  }

  static async updateRequest(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.userId;
      const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = updatePurchaseRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await UpdatePurchaseRequestUseCase.execute({
        requestId,
        organizationId,
        userId,
        input: validationResult.data,
      });

      res.status(200).json({
        success: true,
        message: "Purchase request updated successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode =
        error.message === "Purchase request not found"
          ? 404
          : error.message.includes("only edit your own")
          ? 403
          : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update purchase request",
      });
    }
  }

  static async deleteRequest(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.userId;
      const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await DeletePurchaseRequestUseCase.execute({
        requestId,
        organizationId,
        userId,
      });

      res.status(200).json({
        success: true,
        message: "Purchase request deleted successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode =
        error.message === "Purchase request not found"
          ? 404
          : error.message.includes("only delete your own")
          ? 403
          : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to delete purchase request",
      });
    }
  }

  static async submitRequest(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.tenant!.organizationId;
      const userId = req.user!.userId;
      const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await SubmitPurchaseRequestUseCase.execute({
        requestId,
        organizationId,
        userId,
      });

      res.status(200).json({
        success: true,
        message: "Purchase request submitted for approval",
        data: result,
      });
    } catch (error: any) {
      const statusCode =
        error.message === "Purchase request not found"
          ? 404
          : error.message.includes("only submit your own")
          ? 403
          : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to submit purchase request",
      });
    }
  }
}
