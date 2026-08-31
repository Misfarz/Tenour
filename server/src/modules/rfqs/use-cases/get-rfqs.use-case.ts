import { RfqRepository } from "../rfq.repository";

export class GetRfqsUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    search?: string;
    statusFilter?: string;
  }) {
    return RfqRepository.findRfqsByOrganization({
      organizationId: params.buyerOrganizationId,
      search: params.search,
      statusFilter: params.statusFilter,
    });
  }
}
