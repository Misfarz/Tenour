import { RfqRepository } from "../rfq.repository";

export class GetVendorRfqsUseCase {
  static async execute(vendorId: string) {
    return RfqRepository.findVendorRfqs(vendorId);
  }
}
