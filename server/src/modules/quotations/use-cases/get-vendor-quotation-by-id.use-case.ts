import { QuotationRepository } from "../quotation.repository";
import { formatQuotationResponse } from "../quotation.utils";

export class GetVendorQuotationByIdUseCase {
  static async execute(vendorId: string, quotationId: string) {
    if (!vendorId) {
      throw new Error("Forbidden: Vendor identity required");
    }

    const quotation = await QuotationRepository.findById(quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }

    if (quotation.vendorId !== vendorId) {
      throw new Error("Forbidden: Cannot view another vendor's quotation");
    }

    return formatQuotationResponse(quotation);
  }
}
