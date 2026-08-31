import { NotificationRepository } from "./notification.repository";
import { prisma } from "../../infrastructure/database/prisma/prisma.client";

const notificationRepo = new NotificationRepository();

export class NotificationService {
  // 1. Trigger when a PR is submitted by a requester
  static async notifyPrSubmitted(pr: { id: string; requestNumber: string; title: string; organizationId: string; requesterId: string; requesterName: string }) {
    try {
      // Notify Requester Employee
      await notificationRepo.create({
        recipientType: "BUYER",
        userId: pr.requesterId,
        organizationId: pr.organizationId,
        title: "Requisition Submitted",
        message: `Your request ${pr.requestNumber} (${pr.title}) has been submitted for manager approval.`,
        type: "PR_SUBMITTED",
        link: `/buyer/purchase-requests/${pr.id}`,
      });

      // Find all managers and org admins in the organization
      const members = await prisma.organizationMember.findMany({
        where: {
          organizationId: pr.organizationId,
          userId: { not: pr.requesterId },
          role: {
            name: { in: ["ORG_ADMIN", "MANAGER"] },
          },
        },
        select: { userId: true },
      });

      const notifications = members.map((m) => ({
        recipientType: "BUYER" as const,
        userId: m.userId,
        organizationId: pr.organizationId,
        title: "New Requisition Pending Approval",
        message: `${pr.requesterName} submitted request ${pr.requestNumber} (${pr.title}) for approval.`,
        type: "PR_SUBMITTED",
        link: `/buyer/approvals/${pr.id}`,
      }));

      await notificationRepo.createMany(notifications);
    } catch (err) {
      console.error("[NotificationService] Error in notifyPrSubmitted:", err);
    }
  }

  // 2. Trigger when a PR is approved
  static async notifyPrApproved(pr: { id: string; requestNumber: string; title: string; requesterId: string; approverName: string }) {
    try {
      await notificationRepo.create({
        recipientType: "BUYER",
        userId: pr.requesterId,
        title: "Purchase Request Approved",
        message: `Your request ${pr.requestNumber} (${pr.title}) was approved by ${pr.approverName}.`,
        type: "PR_APPROVED",
        link: `/buyer/purchase-requests/${pr.id}`,
      });
    } catch (err) {
      console.error("[NotificationService] Error in notifyPrApproved:", err);
    }
  }

  // 3. Trigger when a PR is rejected
  static async notifyPrRejected(pr: { id: string; requestNumber: string; title: string; requesterId: string; rejectorName: string; reason?: string }) {
    try {
      await notificationRepo.create({
        recipientType: "BUYER",
        userId: pr.requesterId,
        title: "Purchase Request Rejected",
        message: `Your request ${pr.requestNumber} (${pr.title}) was rejected by ${pr.rejectorName}.${pr.reason ? ` Reason: ${pr.reason}` : ""}`,
        type: "PR_REJECTED",
        link: `/buyer/purchase-requests/${pr.id}`,
      });
    } catch (err) {
      console.error("[NotificationService] Error in notifyPrRejected:", err);
    }
  }

  // 4. Trigger when RFQ is issued to vendors
  static async notifyRfqIssued(rfq: { id: string; rfqNumber: string; title: string; organizationName: string }, vendorIds: string[]) {
    try {
      const notifications = vendorIds.map((vId) => ({
        recipientType: "VENDOR" as const,
        vendorId: vId,
        title: "New RFQ Sourcing Invitation",
        message: `${rfq.organizationName} issued RFQ ${rfq.rfqNumber} (${rfq.title}) to your company.`,
        type: "RFQ_ISSUED",
        link: `/vendor/rfqs/${rfq.id}`,
      }));

      await notificationRepo.createMany(notifications);
    } catch (err) {
      console.error("[NotificationService] Error in notifyRfqIssued:", err);
    }
  }

  // 5. Trigger when a vendor submits a quotation
  static async notifyQuotationSubmitted(quotation: { id: string; quotationNumber: string; vendorName: string; rfqId: string; rfqNumber: string; rfqTitle: string; organizationId: string }) {
    try {
      // Find org admins and buyers
      const members = await prisma.organizationMember.findMany({
        where: {
          organizationId: quotation.organizationId,
        },
        select: { userId: true },
      });

      const notifications = members.map((m) => ({
        recipientType: "BUYER" as const,
        userId: m.userId,
        organizationId: quotation.organizationId,
        title: "Quotation Received",
        message: `${quotation.vendorName} submitted quotation ${quotation.quotationNumber} for RFQ ${quotation.rfqNumber}.`,
        type: "QUOTATION_SUBMITTED",
        link: `/buyer/quotations`,
      }));

      await notificationRepo.createMany(notifications);
    } catch (err) {
      console.error("[NotificationService] Error in notifyQuotationSubmitted:", err);
    }
  }

  // 6. Trigger when a winning quotation is selected
  static async notifyQuotationSelected(rfqId: string, winningQuotationId: string) {
    try {
      const rfq = await prisma.rfq.findUnique({
        where: { id: rfqId },
        include: {
          organization: true,
          quotations: {
            include: { vendor: true },
          },
        },
      });

      if (!rfq) return;

      const notifications = rfq.quotations.map((q) => {
        const isWinner = q.id === winningQuotationId;
        return {
          recipientType: "VENDOR" as const,
          vendorId: q.vendorId,
          title: isWinner ? "Quotation Selected as Winner! 🎉" : "RFQ Sourcing Update",
          message: isWinner
            ? `Congratulations! Your quotation ${q.quotationNumber} was selected as the winner for RFQ ${rfq.rfqNumber}.`
            : `Quotation update for RFQ ${rfq.rfqNumber}: Sourcing decision has been finalized.`,
          type: "QUOTATION_SELECTED",
          link: `/vendor/quotations/${q.id}`,
        };
      });

      await notificationRepo.createMany(notifications);
    } catch (err) {
      console.error("[NotificationService] Error in notifyQuotationSelected:", err);
    }
  }

  // 7. Trigger when PO is issued to vendor
  static async notifyPoIssued(po: { id: string; poNumber: string; vendorId: string; organizationName: string; totalAmount: number }) {
    try {
      await notificationRepo.create({
        recipientType: "VENDOR",
        vendorId: po.vendorId,
        title: "New Purchase Order Received",
        message: `${po.organizationName} issued Purchase Order ${po.poNumber} for ₹${po.totalAmount.toLocaleString("en-IN")}.`,
        type: "PO_ISSUED",
        link: `/vendor/purchase-orders/${po.id}`,
      });
    } catch (err) {
      console.error("[NotificationService] Error in notifyPoIssued:", err);
    }
  }

  // 8. Trigger when PO is acknowledged by vendor
  static async notifyPoAcknowledged(po: { id: string; poNumber: string; vendorName: string; organizationId: string }) {
    try {
      const members = await prisma.organizationMember.findMany({
        where: { organizationId: po.organizationId },
        select: { userId: true },
      });

      const notifications = members.map((m) => ({
        recipientType: "BUYER" as const,
        userId: m.userId,
        organizationId: po.organizationId,
        title: "Purchase Order Acknowledged",
        message: `${po.vendorName} officially acknowledged Purchase Order ${po.poNumber}.`,
        type: "PO_ACKNOWLEDGED",
        link: `/buyer/purchase-orders/${po.id}`,
      }));

      await notificationRepo.createMany(notifications);
    } catch (err) {
      console.error("[NotificationService] Error in notifyPoAcknowledged:", err);
    }
  }

  // 9. Trigger when PO is rejected by vendor
  static async notifyPoRejected(po: { id: string; poNumber: string; vendorName: string; organizationId: string; reason?: string }) {
    try {
      const members = await prisma.organizationMember.findMany({
        where: { organizationId: po.organizationId },
        select: { userId: true },
      });

      const notifications = members.map((m) => ({
        recipientType: "BUYER" as const,
        userId: m.userId,
        organizationId: po.organizationId,
        title: "Purchase Order Rejected by Vendor",
        message: `${po.vendorName} rejected Purchase Order ${po.poNumber}.${po.reason ? ` Reason: ${po.reason}` : ""}`,
        type: "PO_REJECTED",
        link: `/buyer/purchase-orders/${po.id}`,
      }));

      await notificationRepo.createMany(notifications);
    } catch (err) {
      console.error("[NotificationService] Error in notifyPoRejected:", err);
    }
  }

  // 10. Trigger when PO is cancelled by buyer
  static async notifyPoCancelled(po: { id: string; poNumber: string; vendorId: string; organizationName: string; reason?: string }) {
    try {
      await notificationRepo.create({
        recipientType: "VENDOR",
        vendorId: po.vendorId,
        title: "Purchase Order Cancelled",
        message: `${po.organizationName} cancelled Purchase Order ${po.poNumber}.${po.reason ? ` Reason: ${po.reason}` : ""}`,
        type: "PO_CANCELLED",
        link: `/vendor/purchase-orders/${po.id}`,
      });
    } catch (err) {
      console.error("[NotificationService] Error in notifyPoCancelled:", err);
    }
  }
}
