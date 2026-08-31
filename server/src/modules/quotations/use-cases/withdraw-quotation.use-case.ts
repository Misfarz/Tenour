import { QuotationRepository } from "../quotation.repository";
import { formatQuotationResponse } from "../quotation.utils";

export class WithdrawQuotationUseCase {
  static async execute(vendorId: string, quotationId: string) {
    if (!vendorId) {
      throw new Error("Forbidden: Vendor identity required");
    }

    const quotation = await QuotationRepository.findById(quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }

    if (quotation.vendorId !== vendorId) {
      throw new Error("Forbidden: Cannot withdraw another vendor's quotation");
    }

    if (["SELECTED", "REJECTED", "WITHDRAWN"].includes(quotation.status)) {
      throw new Error(`Cannot withdraw quotation in ${quotation.status} state`);
    }

    const withdrawn = await QuotationRepository.update(quotationId, {
      status: "WITHDRAWN",
    });

    return formatQuotationResponse(withdrawn);
  }
}
