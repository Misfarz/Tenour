import { VendorRepository } from "../vendor.repository";

export class GetVendorsUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    search?: string;
    statusFilter?: string;
  }) {
    return VendorRepository.findVendorsByBuyer(params);
  }
}
