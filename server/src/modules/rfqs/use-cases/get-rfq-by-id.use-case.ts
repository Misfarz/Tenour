import { RfqRepository } from "../rfq.repository";

export class GetRfqByIdUseCase {
  static async execute(buyerOrganizationId: string, rfqId: string) {
    const rfq = await RfqRepository.findRfqById(buyerOrganizationId, rfqId);
    if (!rfq) {
      throw new Error("RFQ not found");
    }
    return rfq;
  }
}
