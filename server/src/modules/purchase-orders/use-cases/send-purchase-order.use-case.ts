import { PurchaseOrderRepository } from "../purchase-order.repository";
import { formatPurchaseOrderResponse, isValidPoStatusTransition } from "../purchase-order.utils";
import { BuyerRole } from "../../../shared/constants/roles";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";
import { NotificationService } from "../../notifications/notification.service";

export class SendPurchaseOrderUseCase {
  static async execute(buyerOrganizationId: string, role: string, poId: string) {
    if (![BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT].includes(role as BuyerRole)) {
      throw new Error("Forbidden: Insufficient permissions to send purchase order");
    }

    const po = await PurchaseOrderRepository.findById(poId);
    if (!po || po.organizationId !== buyerOrganizationId) {
      throw new Error("Purchase Order not found");
    }

    if (!isValidPoStatusTransition(po.status, "SENT")) {
      throw new Error(`Cannot send Purchase Order in ${po.status} state. Only DRAFT orders can be sent.`);
    }

    // Verify vendor is active
    const vendor = await prisma.vendor.findUnique({
      where: { id: po.vendorId },
    });
    if (!vendor || vendor.status !== "ACTIVE") {
      throw new Error("Cannot send Purchase Order: Vendor is not active");
    }

    // Verify required order details exist
    if (!po.items || po.items.length === 0) {
      throw new Error("Cannot send Purchase Order: Order contains no items");
    }

    if (!po.deliveryAddress || po.deliveryAddress.trim() === "") {
      throw new Error("Cannot send Purchase Order: Delivery address is required");
    }

    const sentPo = await PurchaseOrderRepository.update(poId, {
      status: "SENT",
      sentAt: new Date(),
    });

    NotificationService.notifyPoIssued({
      id: po.id,
      poNumber: po.poNumber,
      vendorId: po.vendorId,
      organizationName: po.organization?.name || "Buyer Organization",
      totalAmount: Number(po.totalAmount),
    });

    return formatPurchaseOrderResponse(sentPo);
  }
}
