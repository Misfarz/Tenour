import { QuotationRepository } from "../quotation.repository";
import { formatQuotationResponse } from "../quotation.utils";

export class GetVendorQuotationsUseCase {
  static async execute(vendorId: string, statusFilter?: string) {
    if (!vendorId) {
      throw new Error("Forbidden: Vendor identity required");
    }

    const list = await QuotationRepository.findVendorQuotations(vendorId, statusFilter);
    return list.map(formatQuotationResponse);
  }
}
