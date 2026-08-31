import { QuotationRepository } from "../quotation.repository";
import { formatQuotationResponse } from "../quotation.utils";
import { BuyerRole } from "../../../shared/constants/roles";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";

export class SelectQuotationUseCase {
  static async execute(buyerOrganizationId: string, role: string, quotationId: string) {
    if (![BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT].includes(role as BuyerRole)) {
      throw new Error("Forbidden: Insufficient permissions to select winning vendor quotation");
    }

    const quotation = await QuotationRepository.findById(quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }

    // Tenant Isolation
    if (quotation.rfq.organizationId !== buyerOrganizationId) {
      throw new Error("Quotation not found");
    }

    // Status check
    if (!["SUBMITTED", "UNDER_REVIEW"].includes(quotation.status)) {
      throw new Error(`Cannot select quotation in ${quotation.status} state. Only SUBMITTED or UNDER_REVIEW quotations can be selected.`);
    }

    // Expiry check (`validUntil`)
    if (quotation.validUntil && new Date(quotation.validUntil) < new Date()) {
      throw new Error("Quotation validity period has expired and cannot be selected");
    }

    // Check if another quotation has already been selected for this RFQ
    const existingSelected = await prisma.quotation.findFirst({
      where: {
        rfqId: quotation.rfqId,
        status: "SELECTED",
      },
    });

    if (existingSelected) {
      throw new Error("A winning quotation has already been selected for this RFQ");
    }

    // Run DB transaction to select winner & reject competing quotes
    const selected = await QuotationRepository.selectWinningQuotation(
      quotationId,
      quotation.rfqId
    );

    return formatQuotationResponse(selected);
  }
}
