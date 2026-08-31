import { PurchaseRequestRepository } from "../purchase-request.repository";

export class GetPendingApprovalsUseCase {
  static async execute(params: {
    organizationId: string;
    managerUserId: string;
    role: string;
  }) {
    const { organizationId, managerUserId, role } = params;

    if (role !== "MANAGER" && role !== "ORG_ADMIN") {
      throw new Error("Forbidden: Only managers and organization admins can view pending approvals");
    }

    return PurchaseRequestRepository.findPendingApprovals(organizationId, managerUserId, role);
  }
}
