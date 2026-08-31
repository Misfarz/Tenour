import { PurchaseOrderRepository } from "../purchase-order.repository";
import { formatPurchaseOrderResponse } from "../purchase-order.utils";

export class GetVendorPurchaseOrderByIdUseCase {
  static async execute(vendorId: string, poId: string) {
    if (!vendorId) {
      throw new Error("Forbidden: Vendor identity required");
    }

    const po = await PurchaseOrderRepository.findById(poId);
    if (!po) {
      throw new Error("Purchase Order not found");
    }

    if (po.vendorId !== vendorId) {
      throw new Error("Forbidden: Cannot view another vendor's Purchase Order");
    }

    if (po.status === "DRAFT") {
      throw new Error("Purchase Order not found");
    }

    return formatPurchaseOrderResponse(po);
  }
}
