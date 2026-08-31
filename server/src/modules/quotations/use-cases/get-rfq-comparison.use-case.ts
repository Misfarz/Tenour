import { QuotationRepository } from "../quotation.repository";
import { formatQuotationResponse } from "../quotation.utils";
import { BuyerRole } from "../../../shared/constants/roles";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";

export class GetRfqComparisonUseCase {
  static async execute(buyerOrganizationId: string, role: string, rfqId: string) {
    if (![BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT].includes(role as BuyerRole)) {
      throw new Error("Forbidden: Insufficient permissions to view quotation comparison");
    }

    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
      include: {
        items: true,
      },
    });

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    if (rfq.organizationId !== buyerOrganizationId) {
      throw new Error("RFQ not found");
    }

    const quotations = await QuotationRepository.findQuotationsByRfq(rfqId, buyerOrganizationId);
    const formattedQuotations = quotations.map(formatQuotationResponse);

    // Build side-by-side item matrix
    const itemMatrix = rfq.items.map((rfqItem) => {
      const vendorOffers = formattedQuotations.map((q: any) => {
        const qItem = q.items.find((i: any) => i.rfqItemId === rfqItem.id);
        return {
          vendorId: q.vendor.id,
          vendorName: q.vendor.name,
          quotationId: q.id,
          unitPrice: qItem ? qItem.unitPrice : null,
          quantity: qItem ? qItem.quantity : null,
          discount: qItem ? qItem.discount : null,
          tax: qItem ? qItem.tax : null,
          totalPrice: qItem ? qItem.totalPrice : null,
        };
      });

      return {
        rfqItemId: rfqItem.id,
        itemName: rfqItem.name,
        requiredQuantity: rfqItem.quantity,
        unit: rfqItem.unit,
        specifications: rfqItem.specifications,
        vendorOffers,
      };
    });

    return {
      rfq: {
        id: rfq.id,
        rfqNumber: rfq.rfqNumber,
        title: rfq.title,
        status: rfq.status,
        quotationDeadline: rfq.quotationDeadline,
        itemsCount: rfq.items.length,
      },
      quotations: formattedQuotations,
      itemMatrix,
    };
  }
}
