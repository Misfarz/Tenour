import { RejectPurchaseOrderInput } from "../purchase-order.schemas";
import { PurchaseOrderRepository } from "../purchase-order.repository";
import { formatPurchaseOrderResponse, isValidPoStatusTransition } from "../purchase-order.utils";
import { NotificationService } from "../../notifications/notification.service";

export class RejectPurchaseOrderUseCase {
  static async execute(vendorId: string, poId: string, input: RejectPurchaseOrderInput) {
    if (!vendorId) {
      throw new Error("Forbidden: Vendor identity required");
    }

    const po = await PurchaseOrderRepository.findById(poId);
    if (!po) {
      throw new Error("Purchase Order not found");
    }

    if (po.vendorId !== vendorId) {
      throw new Error("Forbidden: Cannot reject another vendor's Purchase Order");
    }

    if (!isValidPoStatusTransition(po.status, "REJECTED")) {
      throw new Error(`Cannot reject Purchase Order in ${po.status} state. Only SENT orders can be rejected.`);
    }

    if (!input.rejectionReason || input.rejectionReason.trim() === "") {
      throw new Error("Rejection reason is required");
    }

    const rejected = await PurchaseOrderRepository.update(poId, {
      status: "REJECTED",
      rejectionReason: input.rejectionReason,
      rejectedAt: new Date(),
    });

    NotificationService.notifyPoRejected({
      id: po.id,
      poNumber: po.poNumber,
      vendorName: po.vendor?.name || "Vendor",
      organizationId: po.organizationId,
      reason: input.rejectionReason,
    });

    return formatPurchaseOrderResponse(rejected);
  }
}
