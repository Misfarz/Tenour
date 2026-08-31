import { Request, Response } from "express";
import { AuthenticatedTenantRequest } from "../../shared/middleware/tenant.middleware";
import {
  createVendorSchema,
  updateVendorSchema,
  updateVendorStatusSchema,
  vendorContactSchema,
  inviteVendorSchema,
  acceptVendorInvitationSchema,
  vendorLoginSchema,
  registerVendorSchema,
} from "./vendor.schemas";
import { CreateVendorUseCase } from "./use-cases/create-vendor.use-case";
import { GetVendorsUseCase } from "./use-cases/get-vendors.use-case";
import { GetVendorDetailUseCase } from "./use-cases/get-vendor-detail.use-case";
import { UpdateVendorUseCase } from "./use-cases/update-vendor.use-case";
import { UpdateVendorStatusUseCase } from "./use-cases/update-vendor-status.use-case";
import { VendorContactUseCases } from "./use-cases/vendor-contacts.use-cases";
import { InviteVendorUseCase } from "./use-cases/invite-vendor.use-case";
import { AcceptVendorInvitationUseCase } from "./use-cases/accept-vendor-invitation.use-case";
import { VendorLoginUseCase } from "./use-cases/vendor-login.use-case";
import { RegisterVendorUseCase } from "./use-cases/register-vendor.use-case";
import { VendorRepository } from "./vendor.repository";

export class VendorController {
  static async createVendor(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;

      const validationResult = createVendorSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await CreateVendorUseCase.execute({
        buyerOrganizationId,
        role,
        input: validationResult.data,
      });

      res.status(201).json({
        success: true,
        message: "Vendor created successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Forbidden") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to create vendor",
      });
    }
  }

  static async getVendors(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const search = req.query.search as string | undefined;
      const sourceFilter = req.query.source as "ALL" | "PLATFORM_REGISTERED" | "MANUALLY_ADDED" | undefined;
      const statusFilter = req.query.status as string | undefined;

      const data = await GetVendorsUseCase.execute({
        buyerOrganizationId,
        search,
        sourceFilter,
        statusFilter,
      });

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch vendors",
      });
    }
  }

  static async getVendorById(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const vendorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const data = await GetVendorDetailUseCase.execute({
        buyerOrganizationId,
        vendorId,
      });

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to fetch vendor detail",
      });
    }
  }

  static async updateVendor(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const vendorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = updateVendorSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await UpdateVendorUseCase.execute({
        buyerOrganizationId,
        vendorId,
        role,
        input: validationResult.data,
      });

      res.status(200).json({
        success: true,
        message: "Vendor updated successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Forbidden") ? 403 : error.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update vendor",
      });
    }
  }

  static async updateVendorStatus(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const vendorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = updateVendorStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await UpdateVendorStatusUseCase.execute({
        buyerOrganizationId,
        vendorId,
        role,
        status: validationResult.data.status,
      });

      res.status(200).json({
        success: true,
        message: `Vendor status updated to ${validationResult.data.status}`,
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Forbidden") ? 403 : error.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update vendor status",
      });
    }
  }

  // --- CONTACTS ---

  static async addContact(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const vendorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = vendorContactSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await VendorContactUseCases.addContact({
        buyerOrganizationId,
        vendorId,
        role,
        input: validationResult.data,
      });

      res.status(201).json({
        success: true,
        message: "Vendor contact added successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Forbidden") ? 403 : error.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to add vendor contact",
      });
    }
  }

  static async getContacts(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const vendorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const data = await VendorContactUseCases.getContacts({
        buyerOrganizationId,
        vendorId,
      });

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to fetch vendor contacts",
      });
    }
  }

  static async updateContact(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const vendorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const contactId = Array.isArray(req.params.contactId) ? req.params.contactId[0] : req.params.contactId;

      const validationResult = vendorContactSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await VendorContactUseCases.updateContact({
        buyerOrganizationId,
        vendorId,
        contactId,
        role,
        input: validationResult.data,
      });

      res.status(200).json({
        success: true,
        message: "Vendor contact updated successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Forbidden") ? 403 : error.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to update vendor contact",
      });
    }
  }

  static async deleteContact(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const vendorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const contactId = Array.isArray(req.params.contactId) ? req.params.contactId[0] : req.params.contactId;

      const result = await VendorContactUseCases.deleteContact({
        buyerOrganizationId,
        vendorId,
        contactId,
        role,
      });

      res.status(200).json({
        success: true,
        message: "Vendor contact deleted successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Forbidden") ? 403 : error.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to delete vendor contact",
      });
    }
  }

  // --- VENDOR INVITATIONS & PORTAL AUTHENTICATION ---

  static async inviteVendor(req: AuthenticatedTenantRequest, res: Response): Promise<void> {
    try {
      const buyerOrganizationId = req.tenant!.organizationId;
      const role = req.tenant!.role;
      const vendorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const validationResult = inviteVendorSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await InviteVendorUseCase.execute({
        buyerOrganizationId,
        vendorId,
        role,
        input: validationResult.data,
      });

      res.status(201).json({
        success: true,
        message: "Vendor invitation sent successfully",
        data: result,
      });
    } catch (error: any) {
      console.log("inviteVendor catch error:", error?.message || error);
      const statusCode = error.message.includes("Forbidden") ? 403 : error.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to send vendor invitation",
      });
    }
  }

  static async acceptVendorInvitation(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = acceptVendorInvitationSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await AcceptVendorInvitationUseCase.execute(validationResult.data);

      res.status(200).json({
        success: true,
        message: "Vendor invitation accepted successfully. You may now log in.",
        data: result,
      });
    } catch (error: any) {
      console.log("acceptVendorInvitation catch error:", error?.message || error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to accept vendor invitation",
      });
    }
  }

  static async vendorLogin(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = vendorLoginSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await VendorLoginUseCase.execute(validationResult.data);

      res.status(200).json({
        success: true,
        message: "Vendor logged in successfully",
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes("Forbidden") ? 403 : 401;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to log in vendor",
      });
    }
  }

  static async registerVendor(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = registerVendorSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await RegisterVendorUseCase.execute(validationResult.data);

      res.status(201).json({
        success: true,
        message: "Vendor registered successfully",
        data: result,
      });
    } catch (error: any) {
      console.log("registerVendor catch error:", error?.message || error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to register vendor account",
      });
    }
  }

  static async getVendorInvitationByToken(req: Request, res: Response): Promise<void> {
    try {
      const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
      const invitation = await VendorRepository.findVendorInvitationByToken(token);
      if (!invitation) {
        res.status(404).json({ success: false, message: "Invitation token not found" });
        return;
      }
      res.status(200).json({
        success: true,
        data: {
          id: invitation.id,
          name: invitation.name,
          email: invitation.email,
          vendorName: invitation.vendor.name,
          buyerOrganizationName: invitation.buyerOrganization.name,
          usedAt: invitation.usedAt,
          expiresAt: invitation.expiresAt,
        },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to fetch invitation details" });
    }
  }
}
