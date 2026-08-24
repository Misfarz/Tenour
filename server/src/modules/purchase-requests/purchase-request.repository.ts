import { prisma } from "../../infrastructure/database/prisma/prisma.client";
import { CreatePurchaseRequestInput, UpdatePurchaseRequestInput } from "./purchase-request.schemas";

export class PurchaseRequestRepository {
  static async generateRequestNumber(): Promise<string> {
    const count = await prisma.purchaseRequest.count();
    let nextNumber = count + 1;
    let candidate = `PR-${String(nextNumber).padStart(6, "0")}`;

    let exists = await prisma.purchaseRequest.findUnique({
      where: { requestNumber: candidate },
    });

    let offset = 0;
    while (exists) {
      offset += 1;
      candidate = `PR-${String(nextNumber + offset).padStart(6, "0")}`;
      exists = await prisma.purchaseRequest.findUnique({
        where: { requestNumber: candidate },
      });
    }

    return candidate;
  }

  static async createRequest(params: {
    organizationId: string;
    requesterId: string;
    input: CreatePurchaseRequestInput;
  }) {
    const { organizationId, requesterId, input } = params;

    const requestNumber = await this.generateRequestNumber();

    // Calculate line item totals & request total
    const processedItems = input.items.map((item) => {
      const estimatedTotal = Number((item.quantity * item.estimatedUnitPrice).toFixed(2));
      return {
        name: item.name.trim(),
        description: item.description?.trim() || null,
        quantity: item.quantity,
        estimatedUnitPrice: item.estimatedUnitPrice,
        estimatedTotal,
      };
    });

    const requestEstimatedTotal = processedItems.reduce((sum, item) => sum + item.estimatedTotal, 0);

    return prisma.purchaseRequest.create({
      data: {
        requestNumber,
        organizationId,
        requesterId,
        departmentId: input.departmentId || null,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        justification: input.justification?.trim() || null,
        status: "DRAFT",
        estimatedTotal: requestEstimatedTotal,
        items: {
          create: processedItems,
        },
      },
      include: {
        items: true,
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: true,
        organization: true,
      },
    });
  }

  static async findRequestsByOrg(organizationId: string, filterUserId?: string) {
    const whereCondition: any = { organizationId };
    if (filterUserId) {
      whereCondition.requesterId = filterUserId;
    }

    return prisma.purchaseRequest.findMany({
      where: whereCondition,
      include: {
        items: true,
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findRequestByIdAndOrg(requestId: string, organizationId: string) {
    return prisma.purchaseRequest.findFirst({
      where: {
        id: requestId,
        organizationId,
      },
      include: {
        items: true,
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: true,
        organization: true,
      },
    });
  }

  static async updateRequest(requestId: string, input: UpdatePurchaseRequestInput) {
    const processedItems = input.items.map((item) => {
      const estimatedTotal = Number((item.quantity * item.estimatedUnitPrice).toFixed(2));
      return {
        name: item.name.trim(),
        description: item.description?.trim() || null,
        quantity: item.quantity,
        estimatedUnitPrice: item.estimatedUnitPrice,
        estimatedTotal,
      };
    });

    const requestEstimatedTotal = processedItems.reduce((sum, item) => sum + item.estimatedTotal, 0);

    return prisma.$transaction(async (tx) => {
      // 1. Delete existing items
      await tx.purchaseRequestItem.deleteMany({
        where: { purchaseRequestId: requestId },
      });

      // 2. Update purchase request & insert new items
      return tx.purchaseRequest.update({
        where: { id: requestId },
        data: {
          title: input.title.trim(),
          description: input.description?.trim() || null,
          justification: input.justification?.trim() || null,
          departmentId: input.departmentId || null,
          estimatedTotal: requestEstimatedTotal,
          items: {
            create: processedItems,
          },
        },
        include: {
          items: true,
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          department: true,
        },
      });
    });
  }

  static async deleteRequest(requestId: string) {
    return prisma.purchaseRequest.delete({
      where: { id: requestId },
    });
  }

  static async submitRequest(requestId: string) {
    return prisma.purchaseRequest.update({
      where: { id: requestId },
      data: {
        status: "PENDING_APPROVAL",
      },
      include: {
        items: true,
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: true,
      },
    });
  }
}
