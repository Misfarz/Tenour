import { QuotationRepository } from "../quotation.repository";
import { formatQuotationResponse } from "../quotation.utils";
import { BuyerRole } from "../../../shared/constants/roles";

export class GetBuyerQuotationByIdUseCase {
  static async execute(buyerOrganizationId: string, role: string, quotationId: string) {
    if (![BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT].includes(role as BuyerRole)) {
      throw new Error("Forbidden: Insufficient permissions to view quotation details");
    }

    const quotation = await QuotationRepository.findById(quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }

    // Tenant Isolation
    if (quotation.rfq.organizationId !== buyerOrganizationId) {
      throw new Error("Quotation not found");
    }

    // Buyer cannot view vendor DRAFT quotes
    if (quotation.status === "DRAFT") {
      throw new Error("Quotation not found");
    }

    return formatQuotationResponse(quotation);
  }
}
