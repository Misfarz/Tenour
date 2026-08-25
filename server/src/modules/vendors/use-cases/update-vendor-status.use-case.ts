import { VendorRepository } from "../vendor.repository";
import { BuyerRole } from "../../../shared/constants/roles";

export class UpdateVendorStatusUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    vendorId: string;
    role: string;
    status: string;
  }) {
    const { buyerOrganizationId, vendorId, role, status } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can change vendor status");
    }

    const existing = await VendorRepository.findBuyerVendor(buyerOrganizationId, vendorId);
    if (!existing) {
      throw new Error("Vendor not found in your organization");
    }

    return VendorRepository.updateBuyerVendorStatus(buyerOrganizationId, vendorId, status);
  }
}
