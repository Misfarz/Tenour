import { RfqRepository } from "../rfq.repository";

export class GetRfqsUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    search?: string;
    statusFilter?: string;
  }) {
    return RfqRepository.findRfqsByOrganization(params);
  }
}
