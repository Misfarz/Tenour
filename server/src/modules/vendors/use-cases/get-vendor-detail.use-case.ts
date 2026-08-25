import { VendorRepository } from "../vendor.repository";

export class GetVendorDetailUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    vendorId: string;
  }) {
    const { buyerOrganizationId, vendorId } = params;

    const vendor = await VendorRepository.findBuyerVendor(buyerOrganizationId, vendorId);
    if (!vendor) {
      throw new Error("Vendor not found in your organization");
    }

    return vendor;
  }
}
