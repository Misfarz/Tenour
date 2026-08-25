import { Response } from "express";
import { AuthenticatedTenantRequest } from "../../shared/middleware/tenant.middleware";
import { createVendorSchema } from "./vendor.schemas";
import { CreateVendorUseCase } from "./use-cases/create-vendor.use-case";

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
}
