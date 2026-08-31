import { PurchaseOrderRepository } from "../purchase-order.repository";
import { formatPurchaseOrderResponse } from "../purchase-order.utils";
import { BuyerRole } from "../../../shared/constants/roles";

export class GetBuyerPurchaseOrderByIdUseCase {
  static async execute(buyerOrganizationId: string, role: string, poId: string) {
    if (![BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT].includes(role as BuyerRole)) {
      throw new Error("Forbidden: Insufficient permissions to view purchase order details");
    }

    const po = await PurchaseOrderRepository.findById(poId);
    if (!po || po.organizationId !== buyerOrganizationId) {
      throw new Error("Purchase Order not found");
    }

    return formatPurchaseOrderResponse(po);
  }
}
