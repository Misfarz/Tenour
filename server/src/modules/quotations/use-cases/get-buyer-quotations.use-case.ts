import { QuotationRepository } from "../quotation.repository";
import { formatQuotationResponse } from "../quotation.utils";
import { BuyerRole } from "../../../shared/constants/roles";

export class GetBuyerQuotationsUseCase {
  static async execute(buyerOrganizationId: string, role: string, statusFilter?: string) {
    if (![BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT].includes(role as BuyerRole)) {
      throw new Error("Forbidden: Insufficient permissions to view organization quotations");
    }

    const list = await QuotationRepository.findBuyerQuotations(buyerOrganizationId, statusFilter);
    return list.map(formatQuotationResponse);
  }
}
