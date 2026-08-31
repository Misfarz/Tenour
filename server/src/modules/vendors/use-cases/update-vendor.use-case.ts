import { UpdateVendorInput } from "../vendor.schemas";
import { VendorRepository } from "../vendor.repository";
import { BuyerRole } from "../../../shared/constants/roles";

import { prisma } from "../../../infrastructure/database/prisma/prisma.client";

export class UpdateVendorUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    vendorId: string;
    role: string;
    input: UpdateVendorInput;
  }) {
    const { buyerOrganizationId, vendorId, role, input } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can update vendors");
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      throw new Error("Vendor not found in your organization");
    }

    if (vendor.source === "PLATFORM_REGISTERED") {
      throw new Error("Forbidden: Platform registered vendors cannot be edited by buyer organizations");
    }

    const existing = await VendorRepository.findBuyerVendor(buyerOrganizationId, vendorId);
    if (!existing) {
      throw new Error("Vendor not found in your organization");
    }

    return VendorRepository.updateVendor(vendorId, input);
  }
}
