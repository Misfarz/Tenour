import { PurchaseRequestRepository } from "../purchase-request.repository";

export class GetPurchaseRequestsUseCase {
  static async execute(params: {
    organizationId: string;
    userId: string;
    role: string;
  }) {
    const { organizationId, userId, role } = params;

    // For EMPLOYEE, scope to their own requests.
    // ORG_ADMIN, MANAGER, PROCUREMENT, FINANCE can view all org requests.
    const filterUserId = role === "EMPLOYEE" ? userId : undefined;

    return PurchaseRequestRepository.findRequestsByOrg(organizationId, filterUserId);
  }
}
