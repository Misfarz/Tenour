import { CreatePurchaseRequestInput } from "../purchase-request.schemas";
import { PurchaseRequestRepository } from "../purchase-request.repository";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";

export class CreatePurchaseRequestUseCase {
  static async execute(params: {
    organizationId: string;
    requesterId: string;
    input: CreatePurchaseRequestInput;
  }) {
    const { organizationId, requesterId, input } = params;

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

    return PurchaseRequestRepository.createRequest({
      organizationId,
      requesterId,
      input,
    });
  }
}
