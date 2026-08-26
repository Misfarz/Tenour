import { RfqRepository } from "../rfq.repository";
import { BuyerRole } from "../../../shared/constants/roles";

export class CancelRfqUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    rfqId: string;
    role: string;
  }) {
    const { buyerOrganizationId, rfqId, role } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can cancel RFQs");
    }

    const rfq = await RfqRepository.findRfqById(buyerOrganizationId, rfqId);
    if (!rfq) {
      throw new Error("RFQ not found");
    }

    if (rfq.status === "CLOSED" || rfq.status === "CANCELLED") {
      throw new Error(`Cannot cancel RFQ: RFQ is already in ${rfq.status} state.`);
    }

    return RfqRepository.updateRfqStatus(rfqId, "CANCELLED");
  }
}
