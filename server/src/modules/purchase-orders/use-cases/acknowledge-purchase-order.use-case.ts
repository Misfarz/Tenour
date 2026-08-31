import { PurchaseOrderRepository } from "../purchase-order.repository";
import { formatPurchaseOrderResponse, isValidPoStatusTransition } from "../purchase-order.utils";
import { NotificationService } from "../../notifications/notification.service";

export class AcknowledgePurchaseOrderUseCase {
  static async execute(vendorId: string, poId: string) {
    if (!vendorId) {
      throw new Error("Forbidden: Vendor identity required");
    }

    const po = await PurchaseOrderRepository.findById(poId);
    if (!po) {
      throw new Error("Purchase Order not found");
    }

    if (po.vendorId !== vendorId) {
      throw new Error("Forbidden: Cannot acknowledge another vendor's Purchase Order");
    }

    if (!isValidPoStatusTransition(po.status, "ACKNOWLEDGED")) {
      throw new Error(`Cannot acknowledge Purchase Order in ${po.status} state. Only SENT orders can be acknowledged.`);
    }

    const acknowledged = await PurchaseOrderRepository.update(poId, {
      status: "ACKNOWLEDGED",
      acknowledgedAt: new Date(),
    });

    NotificationService.notifyPoAcknowledged({
      id: po.id,
      poNumber: po.poNumber,
      vendorName: po.vendor?.name || "Vendor",
      organizationId: po.organizationId,
    });

    return formatPurchaseOrderResponse(acknowledged);
  }
}
