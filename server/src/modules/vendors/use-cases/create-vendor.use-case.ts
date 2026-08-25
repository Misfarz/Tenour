import { CreateVendorInput } from "../vendor.schemas";
import { VendorRepository } from "../vendor.repository";
import { BuyerRole } from "../../../shared/constants/roles";

export class CreateVendorUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    role: string;
    input: CreateVendorInput;
  }) {
    const { buyerOrganizationId, role, input } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can create vendors");
    }

    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Vendor name is required");
    }

    return VendorRepository.createVendorWithBuyer({
      buyerOrganizationId,
      input,
    });
  }
}
