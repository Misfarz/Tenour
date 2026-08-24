import { UpdatePurchaseRequestInput } from "../purchase-request.schemas";
import { PurchaseRequestRepository } from "../purchase-request.repository";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";

export class UpdatePurchaseRequestUseCase {
  static async execute(params: {
    requestId: string;
    organizationId: string;
    userId: string;
    input: UpdatePurchaseRequestInput;
  }) {
    const { requestId, organizationId, userId, input } = params;

    const request = await PurchaseRequestRepository.findRequestByIdAndOrg(requestId, organizationId);
    if (!request) {
      throw new Error("Purchase request not found");
    }

    if (request.requesterId !== userId) {
      throw new Error("You can only edit your own purchase requests");
    }

    if (request.status !== "DRAFT") {
      throw new Error("Cannot edit a submitted or processed purchase request");
    }

    if (input.departmentId) {
      const dept = await prisma.department.findFirst({
        where: {
          id: input.departmentId,
          organizationId,
        },
      });

      if (!dept) {
        throw new Error("Department not found in your organization");
      }
    }

    return PurchaseRequestRepository.updateRequest(requestId, input);
  }
}
