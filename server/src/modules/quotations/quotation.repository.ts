import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/database/prisma/prisma.client";

export interface CreateQuotationItemRepoInput {
  rfqItemId: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  tax: number;
  totalPrice: number;
  notes?: string | null;
}

export interface CreateQuotationRepoInput {
  quotationNumber: string;
  rfqId: string;
  vendorId: string;
  status?: string;
  currency?: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  deliveryDays?: number | null;
  paymentTerms?: string | null;
  warrantyTerms?: string | null;
  validUntil?: Date | null;
  notes?: string | null;
  items: CreateQuotationItemRepoInput[];
}

export class QuotationRepository {
  static async countQuotations(): Promise<number> {
    return prisma.quotation.count();
  }

  static async findById(id: string) {
    return prisma.quotation.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            country: true,
          },
        },
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
            status: true,
            quotationDeadline: true,
            organizationId: true,
          },
        },
        items: {
          include: {
            rfqItem: true,
          },
        },
      },
    });
  }

  static async findActiveByRfqAndVendor(rfqId: string, vendorId: string) {
    return prisma.quotation.findFirst({
      where: {
        rfqId,
        vendorId,
        status: {
          in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "SELECTED"],
        },
      },
      include: {
        items: true,
      },
    });
  }

  static async create(data: CreateQuotationRepoInput) {
    return prisma.quotation.create({
      data: {
        quotationNumber: data.quotationNumber,
        rfqId: data.rfqId,
        vendorId: data.vendorId,
        status: data.status || "DRAFT",
        currency: data.currency || "INR",
        subtotal: new Prisma.Decimal(data.subtotal),
        discount: new Prisma.Decimal(data.discount),
        tax: new Prisma.Decimal(data.tax),
        totalAmount: new Prisma.Decimal(data.totalAmount),
        deliveryDays: data.deliveryDays,
        paymentTerms: data.paymentTerms,
        warrantyTerms: data.warrantyTerms,
        validUntil: data.validUntil,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            rfqItemId: item.rfqItemId,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            quantity: item.quantity,
            discount: new Prisma.Decimal(item.discount),
            tax: new Prisma.Decimal(item.tax),
            totalPrice: new Prisma.Decimal(item.totalPrice),
            notes: item.notes,
          })),
        },
      },
      include: {
        items: {
          include: {
            rfqItem: true,
          },
        },
        vendor: {
          select: { id: true, name: true, email: true },
        },
        rfq: {
          select: { id: true, rfqNumber: true, title: true, status: true },
        },
      },
    });
  }

  static async update(
    id: string,
    data: {
      currency?: string;
      subtotal?: number;
      discount?: number;
      tax?: number;
      totalAmount?: number;
      deliveryDays?: number | null;
      paymentTerms?: string | null;
      warrantyTerms?: string | null;
      validUntil?: Date | null;
      notes?: string | null;
      status?: string;
      submittedAt?: Date | null;
      items?: CreateQuotationItemRepoInput[];
    }
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.quotationItem.deleteMany({
          where: { quotationId: id },
        });

        await tx.quotationItem.createMany({
          data: data.items.map((item) => ({
            quotationId: id,
            rfqItemId: item.rfqItemId,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            quantity: item.quantity,
            discount: new Prisma.Decimal(item.discount),
            tax: new Prisma.Decimal(item.tax),
            totalPrice: new Prisma.Decimal(item.totalPrice),
            notes: item.notes,
          })),
        });
      }

      return tx.quotation.update({
        where: { id },
        data: {
          ...(data.currency !== undefined && { currency: data.currency }),
          ...(data.subtotal !== undefined && { subtotal: new Prisma.Decimal(data.subtotal) }),
          ...(data.discount !== undefined && { discount: new Prisma.Decimal(data.discount) }),
          ...(data.tax !== undefined && { tax: new Prisma.Decimal(data.tax) }),
          ...(data.totalAmount !== undefined && { totalAmount: new Prisma.Decimal(data.totalAmount) }),
          ...(data.deliveryDays !== undefined && { deliveryDays: data.deliveryDays }),
          ...(data.paymentTerms !== undefined && { paymentTerms: data.paymentTerms }),
          ...(data.warrantyTerms !== undefined && { warrantyTerms: data.warrantyTerms }),
          ...(data.validUntil !== undefined && { validUntil: data.validUntil }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.submittedAt !== undefined && { submittedAt: data.submittedAt }),
        },
        include: {
          items: {
            include: {
              rfqItem: true,
            },
          },
          vendor: {
            select: { id: true, name: true, email: true },
          },
          rfq: {
            select: { id: true, rfqNumber: true, title: true, status: true },
          },
        },
      });
    });
  }

  static async findVendorQuotations(vendorId: string, statusFilter?: string) {
    const where: any = { vendorId };
    if (statusFilter) {
      where.status = statusFilter;
    }
    return prisma.quotation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
            status: true,
            quotationDeadline: true,
          },
        },
        items: true,
      },
    });
  }

  static async findBuyerQuotations(buyerOrganizationId: string, statusFilter?: string) {
    const where: any = {
      rfq: {
        organizationId: buyerOrganizationId,
      },
      // DRAFT quotations are visible ONLY to vendor!
      status: {
        not: "DRAFT",
      },
    };

    if (statusFilter && statusFilter !== "DRAFT") {
      where.status = statusFilter;
    }

    return prisma.quotation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
            status: true,
          },
        },
        items: true,
      },
    });
  }

  static async findQuotationsByRfq(rfqId: string, buyerOrganizationId: string) {
    return prisma.quotation.findMany({
      where: {
        rfqId,
        rfq: {
          organizationId: buyerOrganizationId,
        },
        // Exclude draft quotations for buyer
        status: {
          not: "DRAFT",
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            rfqItem: true,
          },
        },
      },
    });
  }

  static async selectWinningQuotation(quotationId: string, rfqId: string) {
    return prisma.$transaction(async (tx) => {
      // Mark target quotation as SELECTED
      const selected = await tx.quotation.update({
        where: { id: quotationId },
        data: { status: "SELECTED" },
        include: {
          vendor: true,
          rfq: true,
          items: true,
        },
      });

      // Mark all other non-draft quotations for this RFQ as REJECTED
      await tx.quotation.updateMany({
        where: {
          rfqId,
          id: { not: quotationId },
          status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
        },
        data: { status: "REJECTED" },
      });

      return selected;
    });
  }
}
