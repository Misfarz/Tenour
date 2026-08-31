import { CreateQuotationInput } from "../quotation.schemas";
import { QuotationRepository } from "../quotation.repository";
import { calculateQuotationTotals, formatQuotationResponse } from "../quotation.utils";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";

export class CreateQuotationUseCase {
  static async execute(vendorId: string, input: CreateQuotationInput) {
    if (!vendorId) {
      throw new Error("Forbidden: Vendor identity required");
    }

    // 1. Check Vendor Active Status
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) {
      throw new Error("Vendor not found");
    }
    if (vendor.status !== "ACTIVE") {
      throw new Error("Forbidden: Vendor account is not ACTIVE");
    }

    // 2. Fetch RFQ & check assignment
    const rfq = await prisma.rfq.findUnique({
      where: { id: input.rfqId },
      include: {
        vendors: true,
        items: true,
      },
    });

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    // Check if RFQ assigned to vendor
    const isAssigned = rfq.vendors.some((v) => v.vendorId === vendorId);
    if (!isAssigned) {
      throw new Error("Forbidden: Vendor was not assigned to this RFQ");
    }

    // Check RFQ Status
    if (rfq.status !== "OPEN") {
      throw new Error("RFQ is not open for quotation submissions");
    }

    // Check RFQ Deadline
    if (new Date(rfq.quotationDeadline) < new Date()) {
      throw new Error("RFQ quotation deadline has expired");
    }

    // Check existing active quotation for this RFQ
    const existingActiveQuote = await QuotationRepository.findActiveByRfqAndVendor(
      input.rfqId,
      vendorId
    );
    if (existingActiveQuote) {
      throw new Error("Vendor already has an active quotation for this RFQ");
    }

    // 3. Verify RFQ Item IDs belong to this RFQ
    const rfqItemMap = new Map(rfq.items.map((i) => [i.id, i]));
    for (const item of input.items) {
      if (!rfqItemMap.has(item.rfqItemId)) {
        throw new Error(`Invalid item: RFQ item ${item.rfqItemId} does not belong to RFQ`);
      }
    }

    // 4. Financial Calculations on Backend
    const totals = calculateQuotationTotals(input.items);

    // 5. Generate Quotation Number (QT-XXXX)
    const count = await QuotationRepository.countQuotations();
    const quotationNumber = `QT-${String(count + 1).padStart(4, "0")}`;

    // 6. Create Quotation
    const createdItems = input.items.map((item) => {
      const calculated = totals.items.find(
        (ci) => ci.unitPrice === (item.unitPrice || 0) && ci.quantity === (item.quantity || 1)
      ) || {
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        discount: item.discount || 0,
        tax: item.tax || 0,
        totalPrice: (item.unitPrice * item.quantity) - (item.discount || 0) + (item.tax || 0),
      };

      return {
        rfqItemId: item.rfqItemId,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        discount: item.discount || 0,
        tax: item.tax || 0,
        totalPrice: calculated.totalPrice,
        notes: item.notes,
      };
    });

    const quotation = await QuotationRepository.create({
      quotationNumber,
      rfqId: input.rfqId,
      vendorId,
      status: "DRAFT",
      currency: input.currency || "INR",
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      totalAmount: totals.totalAmount,
      deliveryDays: input.deliveryDays,
      paymentTerms: input.paymentTerms,
      warrantyTerms: input.warrantyTerms,
      validUntil: input.validUntil ? new Date(input.validUntil) : null,
      notes: input.notes,
      items: createdItems,
    });

    return formatQuotationResponse(quotation);
  }
}
