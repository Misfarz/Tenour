import { PurchaseRequestRepository } from "../purchase-request.repository";

export class GetPendingApprovalsUseCase {
  static async execute(params: {
    organizationId: string;
    managerUserId: string;
    role: string;
  }) {
    const { organizationId, managerUserId, role } = params;

    if (role !== "MANAGER") {
      throw new Error("Forbidden: Only managers can view pending approvals");
    }

    return PurchaseRequestRepository.findPendingApprovals(organizationId, managerUserId);
  }
}
