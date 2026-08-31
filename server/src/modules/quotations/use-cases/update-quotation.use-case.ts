import { UpdateQuotationInput } from "../quotation.schemas";
import { QuotationRepository } from "../quotation.repository";
import { calculateQuotationTotals, formatQuotationResponse } from "../quotation.utils";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";

export class UpdateQuotationUseCase {
  static async execute(vendorId: string, quotationId: string, input: UpdateQuotationInput) {
    if (!vendorId) {
      throw new Error("Forbidden: Vendor identity required");
    }

    const quotation = await QuotationRepository.findById(quotationId);
    if (!quotation) {
      throw new Error("Quotation not found");
    }

    if (quotation.vendorId !== vendorId) {
      throw new Error("Forbidden: Cannot edit another vendor's quotation");
    }

    if (quotation.status !== "DRAFT") {
      throw new Error(`Cannot edit quotation in ${quotation.status} state. Only DRAFT quotations can be modified.`);
    }

    let subtotal = Number(quotation.subtotal);
    let discount = Number(quotation.discount);
    let tax = Number(quotation.tax);
    let totalAmount = Number(quotation.totalAmount);
    let updatedItems: any = undefined;

    if (input.items && input.items.length > 0) {
      const rfq = await prisma.rfq.findUnique({
        where: { id: quotation.rfqId },
        include: { items: true },
      });

      const rfqItemMap = new Map(rfq?.items.map((i) => [i.id, i]) || []);
      for (const item of input.items) {
        if (!rfqItemMap.has(item.rfqItemId)) {
          throw new Error(`Invalid item: RFQ item ${item.rfqItemId} does not belong to RFQ`);
        }
      }

      const totals = calculateQuotationTotals(input.items as any);
      subtotal = totals.subtotal;
      discount = totals.discount;
      tax = totals.tax;
      totalAmount = totals.totalAmount;

      updatedItems = input.items.map((item) => {
        const uPrice = Math.max(0, item.unitPrice || 0);
        const qty = Math.max(1, item.quantity || 1);
        const disc = Math.max(0, item.discount || 0);
        const tx = Math.max(0, item.tax || 0);
        const lineTotal = Math.max(0, uPrice * qty - disc + tx);

        return {
          rfqItemId: item.rfqItemId,
          unitPrice: uPrice,
          quantity: qty,
          discount: disc,
          tax: tx,
          totalPrice: lineTotal,
          notes: item.notes,
        };
      });
    }

    const updated = await QuotationRepository.update(quotationId, {
      currency: input.currency,
      deliveryDays: input.deliveryDays,
      paymentTerms: input.paymentTerms,
      warrantyTerms: input.warrantyTerms,
      validUntil: input.validUntil ? new Date(input.validUntil) : input.validUntil === null ? null : undefined,
      notes: input.notes,
      subtotal,
      discount,
      tax,
      totalAmount,
      items: updatedItems,
    });

    return formatQuotationResponse(updated);
  }
}
