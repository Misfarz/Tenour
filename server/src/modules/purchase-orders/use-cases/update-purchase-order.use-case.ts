import { UpdatePurchaseOrderInput } from "../purchase-order.schemas";
import { PurchaseOrderRepository } from "../purchase-order.repository";
import { formatPurchaseOrderResponse } from "../purchase-order.utils";
import { BuyerRole } from "../../../shared/constants/roles";

export class UpdatePurchaseOrderUseCase {
  static async execute(
    buyerOrganizationId: string,
    role: string,
    poId: string,
    input: UpdatePurchaseOrderInput
  ) {
    if (![BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT].includes(role as BuyerRole)) {
      throw new Error("Forbidden: Insufficient permissions to edit purchase order");
    }

    const po = await PurchaseOrderRepository.findById(poId);
    if (!po || po.organizationId !== buyerOrganizationId) {
      throw new Error("Purchase Order not found");
    }

    if (po.status !== "DRAFT") {
      throw new Error(`Cannot edit Purchase Order in ${po.status} state. Only DRAFT orders can be modified.`);
    }

    const updated = await PurchaseOrderRepository.update(poId, {
      deliveryAddress: input.deliveryAddress,
      deliveryDeadline: input.deliveryDeadline ? new Date(input.deliveryDeadline) : input.deliveryDeadline === null ? null : undefined,
      paymentTerms: input.paymentTerms,
      notes: input.notes,
    });

    return formatPurchaseOrderResponse(updated);
  }
}
