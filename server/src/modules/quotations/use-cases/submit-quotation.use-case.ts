import { QuotationRepository } from "../quotation.repository";
import { formatQuotationResponse } from "../quotation.utils";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";
import { NotificationService } from "../../notifications/notification.service";

export class SubmitQuotationUseCase {
  static async execute(vendorId: string, quotationId: string) {
    if (!vendorId) {
      throw new Error("Forbidden: Vendor identity required");
    }

    const quotation = await QuotationRepository.findById(quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }

    if (quotation.vendorId !== vendorId) {
      throw new Error("Forbidden: Cannot submit another vendor's quotation");
    }

    if (quotation.status !== "DRAFT") {
      throw new Error(`Cannot submit quotation in ${quotation.status} state. Only DRAFT quotations can be submitted.`);
    }

    // Check RFQ Status & Deadline
    const rfq = await prisma.rfq.findUnique({
      where: { id: quotation.rfqId },
      include: { items: true },
    });

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    if (rfq.status !== "OPEN") {
      throw new Error("RFQ is not open for quotation submissions");
    }

    if (new Date(rfq.quotationDeadline) < new Date()) {
      throw new Error("RFQ quotation deadline has expired");
    }

    // Verify all required RFQ items are quoted
    const rfqItemIds = new Set(rfq.items.map((i) => i.id));
    const quotedRfqItemIds = new Set(quotation.items.map((i) => i.rfqItemId));

    for (const itemId of rfqItemIds) {
      if (!quotedRfqItemIds.has(itemId)) {
        throw new Error("All required RFQ items must be quoted before submission");
      }
    }

    // Verify prices & quantities
    for (const item of quotation.items) {
      const uPrice = Number(item.unitPrice);
      if (isNaN(uPrice) || uPrice < 0) {
        throw new Error("Invalid price: Unit price must be a non-negative number");
      }
      if (item.quantity <= 0) {
        throw new Error("Invalid quantity: Quantity must be at least 1");
      }
    }

    const submitted = await QuotationRepository.update(quotationId, {
      status: "SUBMITTED",
      submittedAt: new Date(),
    });

    NotificationService.notifyQuotationSubmitted({
      id: quotation.id,
      quotationNumber: quotation.quotationNumber,
      vendorName: quotation.vendor?.name || "Vendor",
      rfqId: rfq.id,
      rfqNumber: rfq.rfqNumber,
      rfqTitle: rfq.title,
      organizationId: rfq.organizationId,
    });

    return formatQuotationResponse(submitted);
  }
}
