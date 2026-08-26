import { UpdateRfqInput } from "../rfq.schemas";
import { RfqRepository } from "../rfq.repository";
import { VendorRepository } from "../../vendors/vendor.repository";
import { BuyerRole } from "../../../shared/constants/roles";

export class UpdateRfqUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    rfqId: string;
    role: string;
    input: UpdateRfqInput;
  }) {
    const { buyerOrganizationId, rfqId, role, input } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can edit RFQs");
    }

    const rfq = await RfqRepository.findRfqById(buyerOrganizationId, rfqId);
    if (!rfq) {
      throw new Error("RFQ not found");
    }

    if (rfq.status !== "DRAFT") {
      throw new Error(`Cannot edit RFQ in ${rfq.status} state. Editing is only allowed while in DRAFT status.`);
    }

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

    return RfqRepository.updateRfq(rfqId, input);
  }
}
