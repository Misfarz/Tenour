import { prisma } from "../../infrastructure/database/prisma/prisma.client";
import { CreatePurchaseRequestInput, UpdatePurchaseRequestInput } from "./purchase-request.schemas";

export class PurchaseRequestRepository {
  static async generateRequestNumber(): Promise<string> {
    const count = await prisma.purchaseRequest.count();
    const nextNumber = count + 1;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    let candidate = `PR-${String(nextNumber).padStart(4, "0")}${randomSuffix}`;

    let exists = await prisma.purchaseRequest.findUnique({
      where: { requestNumber: candidate },
    });

    let offset = 0;
    while (exists) {
      offset += Math.floor(Math.random() * 10) + 1;
      candidate = `PR-${String(nextNumber + offset).padStart(4, "0")}${randomSuffix}`;
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

    let retries = 3;
    while (retries > 0) {
      try {
        const requestNumber = await this.generateRequestNumber();
        return await prisma.purchaseRequest.create({
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
            approval: {
              include: {
                approver: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });
      } catch (err: any) {
        if (err.code === "P2002" && retries > 1) {
          retries--;
          continue;
        }
        throw err;
      }
    }

    throw new Error("Failed to generate unique request number");
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
        approval: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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
        approval: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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
      await tx.purchaseRequestItem.deleteMany({
        where: { purchaseRequestId: requestId },
      });

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
          approval: {
            include: {
              approver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });
  }

  static async deleteRequest(requestId: string) {
    return prisma.purchaseRequest.delete({
      where: { id: requestId },
    });
  }

  static async submitRequest(requestId: string, organizationId: string) {
    // Look up an active MANAGER in the requester's organization
    const managerMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        status: "ACTIVE",
        role: {
          name: "MANAGER",
        },
      },
    });

    if (!managerMember) {
      throw new Error("No manager available for approval in this organization");
    }

    return prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.purchaseRequest.update({
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

      await tx.purchaseApproval.upsert({
        where: { purchaseRequestId: requestId },
        create: {
          purchaseRequestId: requestId,
          approverId: managerMember.userId,
          status: "PENDING",
        },
        update: {
          approverId: managerMember.userId,
          status: "PENDING",
          rejectionReason: null,
          approvedAt: null,
          rejectedAt: null,
        },
      });

      return tx.purchaseRequest.findUnique({
        where: { id: requestId },
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
          approval: {
            include: {
              approver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });
  }

  static async findPendingApprovals(organizationId: string, managerUserId: string, role?: string) {
    const whereCondition: any = {
      organizationId,
      status: "PENDING_APPROVAL",
    };

    if (role !== "ORG_ADMIN") {
      whereCondition.approval = {
        approverId: managerUserId,
        status: "PENDING",
      };
    } else {
      whereCondition.approval = {
        status: "PENDING",
      };
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
        approval: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async approveRequest(requestId: string, approverUserId: string) {
    return prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.purchaseRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
        },
      });

      await tx.purchaseApproval.update({
        where: { purchaseRequestId: requestId },
        data: {
          status: "APPROVED",
          approverId: approverUserId,
          approvedAt: now,
        },
      });

      return tx.purchaseRequest.findUnique({
        where: { id: requestId },
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
          approval: {
            include: {
              approver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });
  }

  static async rejectRequest(requestId: string, approverUserId: string, reason: string) {
    return prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.purchaseRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
        },
      });

      await tx.purchaseApproval.update({
        where: { purchaseRequestId: requestId },
        data: {
          status: "REJECTED",
          approverId: approverUserId,
          rejectionReason: reason.trim(),
          rejectedAt: now,
        },
      });

      return tx.purchaseRequest.findUnique({
        where: { id: requestId },
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
          approval: {
            include: {
              approver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });
  }
}
