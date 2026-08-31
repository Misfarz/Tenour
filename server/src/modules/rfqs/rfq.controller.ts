import { Request, Response } from "express";
import { AuthenticatedTenantRequest } from "../../shared/middleware/tenant.middleware";
import { AuthenticatedRequest } from "../../shared/middleware/auth.middleware";
import { createRfqSchema, updateRfqSchema } from "./rfq.schemas";
import { CreateRfqUseCase } from "./use-cases/create-rfq.use-case";
import { GetRfqsUseCase } from "./use-cases/get-rfqs.use-case";
import { GetRfqByIdUseCase } from "./use-cases/get-rfq-by-id.use-case";
import { UpdateRfqUseCase } from "./use-cases/update-rfq.use-case";
import { SendRfqUseCase } from "./use-cases/send-rfq.use-case";
import { CancelRfqUseCase } from "./use-cases/cancel-rfq.use-case";
import { GetVendorRfqsUseCase } from "./use-cases/get-vendor-rfqs.use-case";
import { GetVendorRfqByIdUseCase } from "./use-cases/get-vendor-rfq-by-id.use-case";

export class RfqController {
  static async createRfq(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const createdById = req.user!.userId;

      const validationResult = createRfqSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await CreateRfqUseCase.execute({
        buyerOrganizationId,
        createdById,
        role,
        input: validationResult.data,
      });

      res.status(201).json({
        success: true,
        message: "RFQ created successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("CreateRfq Error:", error);
      const statusCode = error.message.includes("Forbidden")
        ? 403
        : error.message.includes("not found")
        ? 404
        : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to create RFQ",
      });
    }
  }

  static async getRfqs(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const search = req.query.search as string | undefined;
      const statusFilter = req.query.status as string | undefined;

      const result = await GetRfqsUseCase.execute({
        buyerOrganizationId,
        search,
        statusFilter,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch RFQs",
      });
    }
  }

  static async getRfqById(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const rfqId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await GetRfqByIdUseCase.execute(buyerOrganizationId, rfqId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to fetch RFQ details",
      });
    }
  }

  static async updateRfq(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const rfqId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = updateRfqSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await UpdateRfqUseCase.execute({
        buyerOrganizationId,
        rfqId,
        role,
        input: validationResult.data,
      });

      res.status(200).json({
        success: true,
        message: "RFQ updated successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Forbidden")
        ? 403
        : error.message.includes("not found")
        ? 404
        : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update RFQ",
      });
    }
  }

  static async sendRfq(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const rfqId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await SendRfqUseCase.execute({
        buyerOrganizationId,
        rfqId,
        role,
      });

      res.status(200).json({
        success: true,
        message: "RFQ sent successfully to selected vendors",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Forbidden")
        ? 403
        : error.message.includes("not found")
        ? 404
        : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to send RFQ",
      });
    }
  }

  static async cancelRfq(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const rfqId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await CancelRfqUseCase.execute({
        buyerOrganizationId,
        rfqId,
        role,
      });

      res.status(200).json({
        success: true,
        message: "RFQ cancelled successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Forbidden")
        ? 403
        : error.message.includes("not found")
        ? 404
        : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to cancel RFQ",
      });
    }
  }

  // --- VENDOR RFQ CONTROLLERS ---

  static async getVendorRfqs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const result = await GetVendorRfqsUseCase.execute(vendorId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch vendor RFQs",
      });
    }
  }

  static async getVendorRfqById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const rfqId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await GetVendorRfqByIdUseCase.execute(vendorId, rfqId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to fetch vendor RFQ details",
      });
    }
  }
}
