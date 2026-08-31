import { CreatePurchaseOrderInput } from "../purchase-order.schemas";
import { PurchaseOrderRepository } from "../purchase-order.repository";
import { formatPurchaseOrderResponse } from "../purchase-order.utils";
import { BuyerRole } from "../../../shared/constants/roles";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";

export class CreatePurchaseOrderUseCase {
  static async execute(
    buyerOrganizationId: string,
    createdById: string,
    role: string,
    input: CreatePurchaseOrderInput
  ) {
    if (![BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT].includes(role as BuyerRole)) {
      throw new Error("Forbidden: Insufficient permissions to create purchase order");
    }

    // Fetch Quotation with items and relations
    const quotation = await prisma.quotation.findUnique({
      where: { id: input.quotationId },
      include: {
        rfq: true,
        vendor: true,
        items: {
          include: {
            rfqItem: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    // Tenant Isolation Check
    if (quotation.rfq.organizationId !== buyerOrganizationId) {
      throw new Error("Quotation not found");
    }

    // Quotation Status Check: Must be SELECTED
    if (quotation.status !== "SELECTED") {
      throw new Error(`Cannot create Purchase Order from quotation in ${quotation.status} state. Quotation must be SELECTED.`);
    }

    // Duplicate PO check
    const existingPo = await PurchaseOrderRepository.findActiveByQuotationId(input.quotationId);
    if (existingPo) {
      throw new Error("A Purchase Order has already been created for this quotation");
    }

    // Generate PO Number (PO-XXXX)
    const count = await PurchaseOrderRepository.countOrders();
    const poNumber = `PO-${String(count + 1).padStart(4, "0")}`;

    // Item Snapshots from Quotation
    const itemSnapshots = quotation.items.map((item) => {
      const uPrice = Number(item.unitPrice);
      const disc = Number(item.discount);
      const tx = Number(item.tax);
      const tPrice = Number(item.totalPrice);

      return {
        rfqItemId: item.rfqItemId,
        name: item.rfqItem?.name || "Item",
        description: item.rfqItem?.description || null,
        quantity: item.quantity,
        unit: item.rfqItem?.unit || "PCS",
        unitPrice: uPrice,
        discount: disc,
        tax: tx,
        totalPrice: tPrice,
      };
    });

    // Create PO
    const po = await PurchaseOrderRepository.create({
      poNumber,
      organizationId: buyerOrganizationId,
      vendorId: quotation.vendorId,
      quotationId: quotation.id,
      rfqId: quotation.rfqId,
      status: "DRAFT",
      currency: quotation.currency || "INR",
      subtotal: Number(quotation.subtotal),
      discount: Number(quotation.discount),
      tax: Number(quotation.tax),
      totalAmount: Number(quotation.totalAmount),
      deliveryAddress: input.deliveryAddress || null,
      deliveryDeadline: input.deliveryDeadline ? new Date(input.deliveryDeadline) : null,
      paymentTerms: input.paymentTerms || quotation.paymentTerms || null,
      notes: input.notes || quotation.notes || null,
      createdById,
      items: itemSnapshots,
    });

    return formatPurchaseOrderResponse(po);
  }
}
