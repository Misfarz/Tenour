import { Response } from "express";
import { AuthenticatedTenantRequest } from "../../shared/middleware/tenant.middleware";
import { AuthenticatedRequest } from "../../shared/middleware/auth.middleware";
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  rejectPurchaseOrderSchema,
  cancelPurchaseOrderSchema,
} from "./purchase-order.schemas";
import { CreatePurchaseOrderUseCase } from "./use-cases/create-purchase-order.use-case";
import { UpdatePurchaseOrderUseCase } from "./use-cases/update-purchase-order.use-case";
import { SendPurchaseOrderUseCase } from "./use-cases/send-purchase-order.use-case";
import { AcknowledgePurchaseOrderUseCase } from "./use-cases/acknowledge-purchase-order.use-case";
import { RejectPurchaseOrderUseCase } from "./use-cases/reject-purchase-order.use-case";
import { CancelPurchaseOrderUseCase } from "./use-cases/cancel-purchase-order.use-case";
import { GetBuyerPurchaseOrdersUseCase } from "./use-cases/get-buyer-purchase-orders.use-case";
import { GetBuyerPurchaseOrderByIdUseCase } from "./use-cases/get-buyer-purchase-order-by-id.use-case";
import { GetVendorPurchaseOrdersUseCase } from "./use-cases/get-vendor-purchase-orders.use-case";
import { GetVendorPurchaseOrderByIdUseCase } from "./use-cases/get-vendor-purchase-order-by-id.use-case";

export class PurchaseOrderController {
  // --- BUYER ENDPOINTS ---

  static async createBuyerPurchaseOrder(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const createdById = req.user!.userId;

      const validationResult = createPurchaseOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await CreatePurchaseOrderUseCase.execute(
        buyerOrganizationId,
        createdById,
        role,
        validationResult.data
      );

      res.status(201).json({
        success: true,
        message: "Purchase Order created successfully",
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : msg.includes("already been created") || msg.includes("already")
        ? 409
        : msg.includes("must be SELECTED") || msg.includes("SELECTED")
        ? 422
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to create Purchase Order",
      });
    }
  }

  static async updateBuyerDraftPurchaseOrder(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const poId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = updatePurchaseOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await UpdatePurchaseOrderUseCase.execute(
        buyerOrganizationId,
        role,
        poId,
        validationResult.data
      );

      res.status(200).json({
        success: true,
        message: "Purchase Order updated successfully",
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
        message: msg || "Failed to update Purchase Order",
      });
    }
  }

  static async sendBuyerPurchaseOrder(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const poId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await SendPurchaseOrderUseCase.execute(buyerOrganizationId, role, poId);

      res.status(200).json({
        success: true,
        message: "Purchase Order sent successfully to vendor",
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : msg.includes("Only DRAFT") || msg.includes("Cannot send")
        ? 409
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to send Purchase Order",
      });
    }
  }

  static async cancelBuyerPurchaseOrder(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const cancelledById = req.user!.userId;
      const poId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = cancelPurchaseOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await CancelPurchaseOrderUseCase.execute(
        buyerOrganizationId,
        cancelledById,
        role,
        poId,
        validationResult.data
      );

      res.status(200).json({
        success: true,
        message: "Purchase Order cancelled successfully",
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : msg.includes("Cannot cancel")
        ? 409
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to cancel Purchase Order",
      });
    }
  }

  static async getBuyerPurchaseOrders(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const search = req.query.search as string | undefined;
      const statusFilter = req.query.status as string | undefined;
      const vendorId = req.query.vendorId as string | undefined;

      const result = await GetBuyerPurchaseOrdersUseCase.execute(
        buyerOrganizationId,
        role,
        search,
        statusFilter,
        vendorId
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
        message: msg || "Failed to fetch Purchase Orders",
      });
    }
  }

  static async getBuyerPurchaseOrderById(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const poId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await GetBuyerPurchaseOrderByIdUseCase.execute(
        buyerOrganizationId,
        role,
        poId
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
        message: msg || "Failed to fetch Purchase Order details",
      });
    }
  }

  // --- VENDOR ENDPOINTS ---

  static async getVendorPurchaseOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const statusFilter = req.query.status as string | undefined;
      const result = await GetVendorPurchaseOrdersUseCase.execute(vendorId, statusFilter);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch vendor Purchase Orders",
      });
    }
  }

  static async getVendorPurchaseOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const poId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await GetVendorPurchaseOrderByIdUseCase.execute(vendorId, poId);

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
        message: msg || "Failed to fetch Purchase Order details",
      });
    }
  }

  static async acknowledgeVendorPurchaseOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const poId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await AcknowledgePurchaseOrderUseCase.execute(vendorId, poId);

      res.status(200).json({
        success: true,
        message: "Purchase Order acknowledged successfully",
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : msg.includes("Only SENT") || msg.includes("Cannot acknowledge")
        ? 409
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to acknowledge Purchase Order",
      });
    }
  }

  static async rejectVendorPurchaseOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendorId = (req.user as any)?.vendorId;
      if (!vendorId) {
        res.status(403).json({ success: false, message: "Forbidden: Vendor authentication required" });
        return;
      }

      const poId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = rejectPurchaseOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await RejectPurchaseOrderUseCase.execute(
        vendorId,
        poId,
        validationResult.data
      );

      res.status(200).json({
        success: true,
        message: "Purchase Order rejected successfully",
        data: result,
      });
    } catch (error: any) {
      const msg = error.message || "";
      const statusCode = msg.includes("Forbidden")
        ? 403
        : msg.includes("not found")
        ? 404
        : msg.includes("Only SENT") || msg.includes("Cannot reject")
        ? 409
        : 400;

      res.status(statusCode).json({
        success: false,
        message: msg || "Failed to reject Purchase Order",
      });
    }
  }
}
