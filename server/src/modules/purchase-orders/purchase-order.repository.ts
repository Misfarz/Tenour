import { Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/database/prisma/prisma.client";

export interface CreatePoItemRepoInput {
  rfqItemId?: string | null;
  name: string;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  discount: number;
  tax: number;
  totalPrice: number;
}

export interface CreatePoRepoInput {
  poNumber: string;
  organizationId: string;
  vendorId: string;
  quotationId: string;
  rfqId: string;
  status?: string;
  currency?: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  deliveryAddress?: string | null;
  deliveryDeadline?: Date | null;
  paymentTerms?: string | null;
  notes?: string | null;
  createdById?: string | null;
  items: CreatePoItemRepoInput[];
}

export class PurchaseOrderRepository {
  static async countOrders(): Promise<number> {
    return prisma.purchaseOrder.count();
  }

  static async findById(id: string) {
    return prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            country: true,
          },
        },
        quotation: {
          select: { id: true, quotationNumber: true, status: true },
        },
        rfq: {
          select: { id: true, rfqNumber: true, title: true },
        },
        items: true,
      },
    });
  }

  static async findActiveByQuotationId(quotationId: string) {
    return prisma.purchaseOrder.findFirst({
      where: {
        quotationId,
        status: {
          not: "CANCELLED",
        },
      },
    });
  }

  static async create(data: CreatePoRepoInput) {
    return prisma.purchaseOrder.create({
      data: {
        poNumber: data.poNumber,
        organizationId: data.organizationId,
        vendorId: data.vendorId,
        quotationId: data.quotationId,
        rfqId: data.rfqId,
        status: data.status || "DRAFT",
        currency: data.currency || "INR",
        subtotal: new Prisma.Decimal(data.subtotal),
        discount: new Prisma.Decimal(data.discount),
        tax: new Prisma.Decimal(data.tax),
        totalAmount: new Prisma.Decimal(data.totalAmount),
        deliveryAddress: data.deliveryAddress,
        deliveryDeadline: data.deliveryDeadline,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        createdById: data.createdById,
        items: {
          create: data.items.map((item) => ({
            rfqItemId: item.rfqItemId,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit || "PCS",
            unitPrice: new Prisma.Decimal(item.unitPrice),
            discount: new Prisma.Decimal(item.discount),
            tax: new Prisma.Decimal(item.tax),
            totalPrice: new Prisma.Decimal(item.totalPrice),
          })),
        },
      },
      include: {
        items: true,
        vendor: {
          select: { id: true, name: true, email: true },
        },
        quotation: {
          select: { id: true, quotationNumber: true },
        },
        rfq: {
          select: { id: true, rfqNumber: true, title: true },
        },
      },
    });
  }

  static async update(
    id: string,
    data: {
      deliveryAddress?: string | null;
      deliveryDeadline?: Date | null;
      paymentTerms?: string | null;
      notes?: string | null;
      rejectionReason?: string | null;
      cancelReason?: string | null;
      cancelledById?: string | null;
      status?: string;
      sentAt?: Date | null;
      acknowledgedAt?: Date | null;
      rejectedAt?: Date | null;
      cancelledAt?: Date | null;
    }
  ) {
    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...(data.deliveryAddress !== undefined && { deliveryAddress: data.deliveryAddress }),
        ...(data.deliveryDeadline !== undefined && { deliveryDeadline: data.deliveryDeadline }),
        ...(data.paymentTerms !== undefined && { paymentTerms: data.paymentTerms }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.rejectionReason !== undefined && { rejectionReason: data.rejectionReason }),
        ...(data.cancelReason !== undefined && { cancelReason: data.cancelReason }),
        ...(data.cancelledById !== undefined && { cancelledById: data.cancelledById }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.sentAt !== undefined && { sentAt: data.sentAt }),
        ...(data.acknowledgedAt !== undefined && { acknowledgedAt: data.acknowledgedAt }),
        ...(data.rejectedAt !== undefined && { rejectedAt: data.rejectedAt }),
        ...(data.cancelledAt !== undefined && { cancelledAt: data.cancelledAt }),
      },
      include: {
        items: true,
        vendor: {
          select: { id: true, name: true, email: true },
        },
        quotation: {
          select: { id: true, quotationNumber: true },
        },
        rfq: {
          select: { id: true, rfqNumber: true, title: true },
        },
      },
    });
  }

  static async findBuyerOrders(
    organizationId: string,
    search?: string,
    statusFilter?: string,
    vendorId?: string
  ) {
    const where: any = { organizationId };

    if (statusFilter) {
      where.status = statusFilter;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (search) {
      where.OR = [
        { poNumber: { contains: search, mode: "insensitive" } },
        { vendor: { name: { contains: search, mode: "insensitive" } } },
        { rfq: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    return prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        vendor: {
          select: { id: true, name: true, email: true },
        },
        quotation: {
          select: { id: true, quotationNumber: true },
        },
        rfq: {
          select: { id: true, rfqNumber: true, title: true },
        },
        items: true,
      },
    });
  }

  static async findVendorOrders(vendorId: string, statusFilter?: string) {
    const where: any = {
      vendorId,
      // Draft POs are INVISIBLE to vendor!
      status: {
        not: "DRAFT",
      },
    };

    if (statusFilter && statusFilter !== "DRAFT") {
      where.status = statusFilter;
    }

    return prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        organization: {
          select: { id: true, name: true },
        },
        quotation: {
          select: { id: true, quotationNumber: true },
        },
        rfq: {
          select: { id: true, rfqNumber: true, title: true },
        },
        items: true,
      },
    });
  }
}
