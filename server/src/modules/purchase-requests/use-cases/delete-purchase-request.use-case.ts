import { PurchaseRequestRepository } from "../purchase-request.repository";

export class DeletePurchaseRequestUseCase {
  static async execute(params: {
    requestId: string;
    organizationId: string;
    userId: string;
  }) {
    const { requestId, organizationId, userId } = params;

    const request = await PurchaseRequestRepository.findRequestByIdAndOrg(requestId, organizationId);
    if (!request) {
      throw new Error("Purchase request not found");
    }

    if (request.requesterId !== userId) {
      throw new Error("You can only delete your own purchase requests");
    }

    if (request.status !== "DRAFT") {
      throw new Error("Cannot delete a submitted or processed purchase request");
    }

    await PurchaseRequestRepository.deleteRequest(requestId);

    return {
      id: requestId,
      requestNumber: request.requestNumber,
    };
  }
}
