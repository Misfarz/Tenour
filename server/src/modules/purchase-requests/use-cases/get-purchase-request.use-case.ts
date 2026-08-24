import { PurchaseRequestRepository } from "../purchase-request.repository";

export class GetPurchaseRequestUseCase {
  static async execute(params: {
    requestId: string;
    organizationId: string;
    userId: string;
    role: string;
  }) {
    const { requestId, organizationId, userId, role } = params;

    const request = await PurchaseRequestRepository.findRequestByIdAndOrg(requestId, organizationId);
    if (!request) {
      throw new Error("Purchase request not found");
    }

    // Employees can only view their own requests
    if (role === "EMPLOYEE" && request.requesterId !== userId) {
      throw new Error("Purchase request not found");
    }

    return request;
  }
}
