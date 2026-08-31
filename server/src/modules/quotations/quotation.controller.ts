import { Response } from "express";
import { AuthenticatedTenantRequest } from "../../shared/middleware/tenant.middleware";
import { AuthenticatedRequest } from "../../shared/middleware/auth.middleware";
import {
  createQuotationSchema,
  updateQuotationSchema,
  selectQuotationSchema,
} from "./quotation.schemas";
import { CreateQuotationUseCase } from "./use-cases/create-quotation.use-case";
import { UpdateQuotationUseCase } from "./use-cases/update-quotation.use-case";
import { SubmitQuotationUseCase } from "./use-cases/submit-quotation.use-case";
import { WithdrawQuotationUseCase } from "./use-cases/withdraw-quotation.use-case";
import { GetVendorQuotationsUseCase } from "./use-cases/get-vendor-quotations.use-case";
import { GetVendorQuotationByIdUseCase } from "./use-cases/get-vendor-quotation-by-id.use-case";
import { GetBuyerQuotationsUseCase } from "./use-cases/get-buyer-quotations.use-case";
import { GetBuyerQuotationByIdUseCase } from "./use-cases/get-buyer-quotation-by-id.use-case";
import { GetRfqComparisonUseCase } from "./use-cases/get-rfq-comparison.use-case";
import { SelectQuotationUseCase } from "./use-cases/select-quotation.use-case";

export class QuotationController {
  // --- VENDOR ENDPOINTS ---

  static async createVendorQuotation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const validationResult = createQuotationSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await CreateQuotationUseCase.execute(vendorId, validationResult.data);

      res.status(201).json({
        success: true,
        message: "Quotation created successfully",
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : msg.includes("already has an active quotation") || msg.includes("already")
        ? 409
        : msg.includes("expired")
        ? 422
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to create quotation",
      });
    }
  }

  static async updateVendorDraftQuotation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const quotationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = updateQuotationSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await UpdateQuotationUseCase.execute(
        vendorId,
        quotationId,
        validationResult.data
      );

      res.status(200).json({
        success: true,
        message: "Quotation updated successfully",
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : msg.includes("Only DRAFT") || msg.includes("Cannot edit")
        ? 409
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to update quotation",
      });
    }
  }

  static async submitVendorQuotation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const quotationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await SubmitQuotationUseCase.execute(vendorId, quotationId);

      res.status(200).json({
        success: true,
        message: "Quotation submitted successfully",
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : msg.includes("expired")
        ? 422
        : msg.includes("Only DRAFT") || msg.includes("Cannot submit")
        ? 409
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to submit quotation",
      });
    }
  }

  static async withdrawVendorQuotation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const quotationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await WithdrawQuotationUseCase.execute(vendorId, quotationId);

      res.status(200).json({
        success: true,
        message: "Quotation withdrawn successfully",
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to withdraw quotation",
      });
    }
  }

  static async getVendorQuotations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const statusFilter = req.query.status as string | undefined;
      const result = await GetVendorQuotationsUseCase.execute(vendorId, statusFilter);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch vendor quotations",
      });
    }
  }

  static async getVendorQuotationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const quotationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await GetVendorQuotationByIdUseCase.execute(vendorId, quotationId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to fetch quotation details",
      });
    }
  }

  // --- BUYER ENDPOINTS ---

  static async getBuyerQuotations(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const statusFilter = req.query.status as string | undefined;

      const result = await GetBuyerQuotationsUseCase.execute(
        buyerOrganizationId,
        role,
        statusFilter
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to fetch quotations",
      });
    }
  }

  static async getBuyerQuotationById(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const quotationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await GetBuyerQuotationByIdUseCase.execute(
        buyerOrganizationId,
        role,
        quotationId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to fetch quotation details",
      });
    }
  }

  static async getRfqComparison(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const rfqId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await GetRfqComparisonUseCase.execute(
        buyerOrganizationId,
        role,
        rfqId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to fetch quotation comparison",
      });
    }
  }

  static async selectWinningQuotation(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const quotationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await SelectQuotationUseCase.execute(
        buyerOrganizationId,
        role,
        quotationId
      );

      res.status(200).json({
        success: true,
        message: "Winning vendor quotation selected successfully",
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : msg.includes("expired")
        ? 422
        : msg.includes("already been selected") || msg.includes("Cannot select")
        ? 409
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to select winning quotation",
      });
    }
  }
}
