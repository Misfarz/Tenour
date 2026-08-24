import { PurchaseRequestRepository } from "../purchase-request.repository";

export class ApprovePurchaseRequestUseCase {
  static async execute(params: {
    requestId: string;
    organizationId: string;
    approverUserId: string;
    role: string;
  }) {
    const { requestId, organizationId, approverUserId, role } = params;

    if (role !== "MANAGER") {
      throw new Error("Forbidden: Only managers can approve purchase requests");
    }

    const request = await PurchaseRequestRepository.findRequestByIdAndOrg(requestId, organizationId);
    if (!request) {
      throw new Error("Purchase request not found");
    }

    if (request.requesterId === approverUserId) {
      throw new Error("Self-approval forbidden: You cannot approve your own purchase request");
    }

    if (request.status !== "PENDING_APPROVAL") {
      throw new Error(`Cannot approve request in status ${request.status}. Only PENDING_APPROVAL requests can be approved.`);
    }

    return PurchaseRequestRepository.approveRequest(requestId, approverUserId);
  }
}
