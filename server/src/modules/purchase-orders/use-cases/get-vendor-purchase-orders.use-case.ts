import { PurchaseOrderRepository } from "../purchase-order.repository";
import { formatPurchaseOrderResponse } from "../purchase-order.utils";

export class GetVendorPurchaseOrdersUseCase {
  static async execute(vendorId: string, statusFilter?: string) {
    if (!vendorId) {
      throw new Error("Forbidden: Vendor identity required");
    }

    const list = await PurchaseOrderRepository.findVendorOrders(vendorId, statusFilter);
    return list.map(formatPurchaseOrderResponse);
  }
}
