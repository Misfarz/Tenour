import { PurchaseOrderRepository } from "../purchase-order.repository";
import { formatPurchaseOrderResponse } from "../purchase-order.utils";
import { BuyerRole } from "../../../shared/constants/roles";

export class GetBuyerPurchaseOrdersUseCase {
  static async execute(
    buyerOrganizationId: string,
    role: string,
    search?: string,
    statusFilter?: string,
    vendorId?: string
  ) {
    if (![BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT].includes(role as BuyerRole)) {
      throw new Error("Forbidden: Insufficient permissions to view purchase orders");
    }

    const list = await PurchaseOrderRepository.findBuyerOrders(
      buyerOrganizationId,
      search,
      statusFilter,
      vendorId
    );

    return list.map(formatPurchaseOrderResponse);
  }
}
