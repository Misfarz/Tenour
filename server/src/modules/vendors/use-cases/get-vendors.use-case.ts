import { VendorRepository } from "../vendor.repository";

export class GetVendorsUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    search?: string;
    sourceFilter?: "ALL" | "PLATFORM_REGISTERED" | "MANUALLY_ADDED";
    statusFilter?: string;
  }) {
    return VendorRepository.findVendorsByBuyer(params);
  }
}
