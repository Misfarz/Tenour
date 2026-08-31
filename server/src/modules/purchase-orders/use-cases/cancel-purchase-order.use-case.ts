import { CancelPurchaseOrderInput } from "../purchase-order.schemas";
import { PurchaseOrderRepository } from "../purchase-order.repository";
import { formatPurchaseOrderResponse, isValidPoStatusTransition } from "../purchase-order.utils";
import { BuyerRole } from "../../../shared/constants/roles";
import { NotificationService } from "../../notifications/notification.service";

export class CancelPurchaseOrderUseCase {
  static async execute(
    buyerOrganizationId: string,
    cancelledById: string,
    role: string,
    poId: string,
    input: CancelPurchaseOrderInput
  ) {
    if (![BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT].includes(role as BuyerRole)) {
      throw new Error("Forbidden: Insufficient permissions to cancel purchase order");
    }

    const po = await PurchaseOrderRepository.findById(poId);
    if (!po || po.organizationId !== buyerOrganizationId) {
      throw new Error("Purchase Order not found");
    }

    if (!isValidPoStatusTransition(po.status, "CANCELLED")) {
      throw new Error(`Cannot cancel Purchase Order in ${po.status} state.`);
    }

    if (!input.cancelReason || input.cancelReason.trim() === "") {
      throw new Error("Cancellation reason is required");
    }

    const cancelled = await PurchaseOrderRepository.update(poId, {
      status: "CANCELLED",
      cancelReason: input.cancelReason,
      cancelledById,
      cancelledAt: new Date(),
    });

    NotificationService.notifyPoCancelled({
      id: po.id,
      poNumber: po.poNumber,
      vendorId: po.vendorId,
      organizationName: po.organization?.name || "Buyer Organization",
      reason: input.cancelReason,
    });

    return formatPurchaseOrderResponse(cancelled);
  }
}
