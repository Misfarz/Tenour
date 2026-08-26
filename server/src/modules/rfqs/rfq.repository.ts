import { prisma } from "../../infrastructure/database/prisma/prisma.client";
import { CreateRfqInput, UpdateRfqInput } from "./rfq.schemas";

export class RfqRepository {
  static async generateRfqNumber(): Promise<string> {
    const count = await prisma.rfq.count();
    const sequence = (count + 1).toString().padStart(4, "0");
    return `RFQ-${sequence}`;
  }

  static async createRfq(params: {
    organizationId: string;
    createdById: string;
    input: CreateRfqInput;
  }) {
    const { organizationId, createdById, input } = params;
    const rfqNumber = await this.generateRfqNumber();

    return prisma.$transaction(async (tx) => {
      const rfq = await tx.rfq.create({
        data: {
          rfqNumber,
          organizationId,
          purchaseRequestId: input.purchaseRequestId,
          title: input.title.trim(),
          description: input.description?.trim() || null,
          status: "DRAFT",
          quotationDeadline: new Date(input.quotationDeadline),
          deliveryRequirement: input.deliveryRequirement?.trim() || null,
          createdById,
          items: {
            create: input.items.map((item) => ({
              name: item.name.trim(),
              description: item.description?.trim() || null,
              quantity: item.quantity,
              unit: item.unit?.trim() || "PCS",
              specifications: item.specifications?.trim() || null,
            })),
          },
        },
      });

      if (input.vendorIds && input.vendorIds.length > 0) {
        await tx.rfqVendor.createMany({
          data: input.vendorIds.map((vendorId) => ({
            rfqId: rfq.id,
            vendorId,
            status: "PENDING",
          })),
        });
      }

      return tx.rfq.findUnique({
        where: { id: rfq.id },
        include: {
          items: true,
          vendors: {
            include: {
              vendor: true,
            },
          },
          purchaseRequest: true,
        },
      });
    });
  }

  static async findRfqsByOrganization(params: {
    organizationId: string;
    search?: string;
    statusFilter?: string;
  }) {
    const { organizationId, search, statusFilter } = params;

    const where: any = { organizationId };
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      where.OR = [
        { rfqNumber: { contains: term, mode: "insensitive" } },
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ];
    }

    return prisma.rfq.findMany({
      where,
      include: {
        items: true,
        vendors: {
          include: {
            vendor: true,
          },
        },
        purchaseRequest: {
          select: {
            id: true,
            requestNumber: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findRfqById(organizationId: string, rfqId: string) {
    return prisma.rfq.findFirst({
      where: { id: rfqId, organizationId },
      include: {
        items: true,
        vendors: {
          include: {
            vendor: true,
          },
        },
        purchaseRequest: {
          include: {
            requester: {
              select: { id: true, name: true, email: true },
            },
            approval: true,
          },
        },
      },
    });
  }

  static async updateRfq(rfqId: string, input: UpdateRfqInput) {
    return prisma.$transaction(async (tx) => {
      // If items provided, replace items
      if (input.items) {
        await tx.rfqItem.deleteMany({ where: { rfqId } });
        await tx.rfqItem.createMany({
          data: input.items.map((item) => ({
            rfqId,
            name: item.name.trim(),
            description: item.description?.trim() || null,
            quantity: item.quantity,
            unit: item.unit?.trim() || "PCS",
            specifications: item.specifications?.trim() || null,
          })),
        });
      }

      // If vendorIds provided, replace vendors
      if (input.vendorIds) {
        await tx.rfqVendor.deleteMany({ where: { rfqId } });
        if (input.vendorIds.length > 0) {
          await tx.rfqVendor.createMany({
            data: input.vendorIds.map((vendorId) => ({
              rfqId,
              vendorId,
              status: "PENDING",
            })),
          });
        }
      }

      // Update main RFQ fields
      return tx.rfq.update({
        where: { id: rfqId },
        data: {
          ...(input.title && { title: input.title.trim() }),
          ...(input.description !== undefined && { description: input.description?.trim() || null }),
          ...(input.quotationDeadline && { quotationDeadline: new Date(input.quotationDeadline) }),
          ...(input.deliveryRequirement !== undefined && { deliveryRequirement: input.deliveryRequirement?.trim() || null }),
        },
        include: {
          items: true,
          vendors: {
            include: { vendor: true },
          },
          purchaseRequest: true,
        },
      });
    });
  }

  static async sendRfq(rfqId: string) {
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      await tx.rfqVendor.updateMany({
        where: { rfqId },
        data: {
          status: "SENT",
          sentAt: now,
        },
      });

      return tx.rfq.update({
        where: { id: rfqId },
        data: {
          status: "OPEN",
        },
        include: {
          items: true,
          vendors: {
            include: { vendor: true },
          },
          purchaseRequest: true,
        },
      });
    });
  }

  static async updateRfqStatus(rfqId: string, status: string) {
    return prisma.rfq.update({
      where: { id: rfqId },
      data: { status },
      include: {
        items: true,
        vendors: {
          include: { vendor: true },
        },
      },
    });
  }

  // --- VENDOR PORTAL RFQ METHODS ---

  static async findVendorRfqs(vendorId: string) {
    const rfqVendors = await prisma.rfqVendor.findMany({
      where: {
        vendorId,
        rfq: {
          status: { in: ["SENT", "OPEN", "CLOSED"] },
        },
      },
      include: {
        rfq: {
          include: {
            items: true,
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return rfqVendors.map((rv) => ({
      id: rv.rfq.id,
      rfqNumber: rv.rfq.rfqNumber,
      title: rv.rfq.title,
      description: rv.rfq.description,
      status: rv.rfq.status,
      quotationDeadline: rv.rfq.quotationDeadline,
      deliveryRequirement: rv.rfq.deliveryRequirement,
      createdAt: rv.rfq.createdAt,
      buyer: {
        id: rv.rfq.organization.id,
        name: rv.rfq.organization.name,
      },
      itemsCount: rv.rfq.items.length,
      items: rv.rfq.items,
    }));
  }

  static async findVendorRfqById(vendorId: string, rfqId: string) {
    const rfqVendor = await prisma.rfqVendor.findFirst({
      where: {
        rfqId,
        vendorId,
        rfq: {
          status: { in: ["SENT", "OPEN", "CLOSED"] },
        },
      },
      include: {
        rfq: {
          include: {
            items: true,
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!rfqVendor) return null;

    return {
      id: rfqVendor.rfq.id,
      rfqNumber: rfqVendor.rfq.rfqNumber,
      title: rfqVendor.rfq.title,
      description: rfqVendor.rfq.description,
      status: rfqVendor.rfq.status,
      quotationDeadline: rfqVendor.rfq.quotationDeadline,
      deliveryRequirement: rfqVendor.rfq.deliveryRequirement,
      createdAt: rfqVendor.rfq.createdAt,
      buyer: {
        id: rfqVendor.rfq.organization.id,
        name: rfqVendor.rfq.organization.name,
      },
      items: rfqVendor.rfq.items,
    };
  }
}
