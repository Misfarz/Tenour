import { RfqRepository } from "../rfq.repository";

export class GetVendorRfqByIdUseCase {
  static async execute(vendorId: string, rfqId: string) {
    const rfq = await RfqRepository.findVendorRfqById(vendorId, rfqId);
    if (!rfq) {
      throw new Error("RFQ not found or not assigned to your vendor organization");
    }
    return rfq;
  }
}
