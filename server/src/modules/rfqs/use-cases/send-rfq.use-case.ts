import { RfqRepository } from "../rfq.repository";
import { VendorRepository } from "../../vendors/vendor.repository";
import { BuyerRole } from "../../../shared/constants/roles";

export class SendRfqUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    rfqId: string;
    role: string;
  }) {
    const { buyerOrganizationId, rfqId, role } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can send RFQs");
    }

    const rfq = await RfqRepository.findRfqById(buyerOrganizationId, rfqId);
    if (!rfq) {
      throw new Error("RFQ not found");
    }

    if (rfq.status !== "DRAFT") {
      throw new Error(`Cannot send RFQ: RFQ is currently in ${rfq.status} state. Only DRAFT RFQs can be sent.`);
    }

    // 1. Verify Purchase Request is APPROVED
    if (rfq.purchaseRequest.status !== "APPROVED") {
      throw new Error("Cannot send RFQ: Associated Purchase Request is not APPROVED");
    }

    // 2. Verify RFQ contains items
    if (!rfq.items || rfq.items.length === 0) {
      throw new Error("Cannot send RFQ: RFQ must contain at least one line item");
    }

    // 3. Verify RFQ has at least one vendor selected
    if (!rfq.vendors || rfq.vendors.length === 0) {
      throw new Error("Cannot send RFQ: At least one vendor must be selected");
    }

    // 4. Verify selected vendors are ACTIVE
    for (const rfqVendor of rfq.vendors) {
      const buyerVendor = await VendorRepository.findBuyerVendor(buyerOrganizationId, rfqVendor.vendorId);
      if (!buyerVendor || buyerVendor.buyerVendorStatus !== "ACTIVE") {
        throw new Error(`Cannot send RFQ: Selected vendor ${rfqVendor.vendor.name} is not ACTIVE`);
      }
    }

    // 5. Verify quotation deadline is valid (in the future)
    if (new Date(rfq.quotationDeadline).getTime() <= Date.now()) {
      throw new Error("Cannot send RFQ: Quotation deadline must be in the future");
    }

    return RfqRepository.sendRfq(rfqId);
  }
}
