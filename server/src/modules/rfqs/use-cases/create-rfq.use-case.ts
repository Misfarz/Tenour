import { CreateRfqInput } from "../rfq.schemas";
import { RfqRepository } from "../rfq.repository";
import { PurchaseRequestRepository } from "../../purchase-requests/purchase-request.repository";
import { VendorRepository } from "../../vendors/vendor.repository";
import { BuyerRole } from "../../../shared/constants/roles";

export class CreateRfqUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    createdById: string;
    role: string;
    input: CreateRfqInput;
  }) {
    const { buyerOrganizationId, createdById, role, input } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can create RFQs");
    }

    // 1. Verify Purchase Request exists and belongs to current org
    const purchaseRequest = await PurchaseRequestRepository.findRequestByIdAndOrg(input.purchaseRequestId, buyerOrganizationId);
    if (!purchaseRequest) {
      throw new Error("Purchase Request not found in your organization");
    }

    // 2. Verify Purchase Request status is APPROVED
    if (purchaseRequest.status !== "APPROVED") {
      throw new Error("Cannot create RFQ: Purchase Request must be APPROVED");
    }

    // 3. Verify selected vendors belong to current org and are ACTIVE
    if (input.vendorIds && input.vendorIds.length > 0) {
      for (const vendorId of input.vendorIds) {
        const buyerVendor = await VendorRepository.findBuyerVendor(buyerOrganizationId, vendorId);
        if (!buyerVendor) {
          throw new Error(`Vendor ${vendorId} not found in your organization`);
        }
        if (buyerVendor.buyerVendorStatus !== "ACTIVE") {
          throw new Error(`Cannot select vendor ${buyerVendor.name}: Vendor relationship is not ACTIVE`);
        }
      }
    }

    return RfqRepository.createRfq({
      organizationId: buyerOrganizationId,
      createdById,
      input,
    });
  }
}
