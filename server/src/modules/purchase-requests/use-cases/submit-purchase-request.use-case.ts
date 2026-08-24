import { PurchaseRequestRepository } from "../purchase-request.repository";

export class SubmitPurchaseRequestUseCase {
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
      throw new Error("You can only submit your own purchase requests");
    }

    if (request.status !== "DRAFT") {
      throw new Error("Request has already been submitted or processed");
    }

    if (!request.title || request.title.trim().length === 0) {
      throw new Error("Cannot submit request with missing title");
    }

    if (!request.items || request.items.length === 0) {
      throw new Error("Cannot submit request without items");
    }

    for (const item of request.items) {
      if (item.quantity <= 0) {
        throw new Error(`Item ${item.name} has invalid quantity`);
      }
      if (item.estimatedUnitPrice < 0) {
        throw new Error(`Item ${item.name} has invalid price`);
      }
    }

    return PurchaseRequestRepository.submitRequest(requestId);
  }
}
