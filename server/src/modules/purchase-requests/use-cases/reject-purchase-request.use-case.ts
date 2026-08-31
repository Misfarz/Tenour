import { RejectPurchaseRequestInput } from "../purchase-request.schemas";
import { PurchaseRequestRepository } from "../purchase-request.repository";

export class RejectPurchaseRequestUseCase {
  static async execute(params: {
    requestId: string;
    organizationId: string;
    approverUserId: string;
    role: string;
    input: RejectPurchaseRequestInput;
  }) {
    const { requestId, organizationId, approverUserId, role, input } = params;

    if (role !== "MANAGER" && role !== "ORG_ADMIN") {
      throw new Error("Forbidden: Only managers and organization admins can reject purchase requests");
    }

    const request = await PurchaseRequestRepository.findRequestByIdAndOrg(requestId, organizationId);
    if (!request) {
      throw new Error("Purchase request not found");
    }

    if (request.requesterId === approverUserId) {
      throw new Error("Self-approval forbidden: You cannot reject your own purchase request");
    }

    if (request.status !== "PENDING_APPROVAL") {
      throw new Error(`Cannot reject request in status ${request.status}. Only PENDING_APPROVAL requests can be rejected.`);
    }

    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error("Rejection reason is required");
    }

    return PurchaseRequestRepository.rejectRequest(requestId, approverUserId, input.reason);
  }
}
