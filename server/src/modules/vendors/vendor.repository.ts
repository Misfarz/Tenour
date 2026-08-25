import { prisma } from "../../infrastructure/database/prisma/prisma.client";
import {
  CreateVendorInput,
  UpdateVendorInput,
  VendorContactInput,
} from "./vendor.schemas";
import crypto from "crypto";

export class VendorRepository {
  static async createVendorWithBuyer(params: {
    buyerOrganizationId: string;
    input: CreateVendorInput;
  }) {
    const { buyerOrganizationId, input } = params;

    return prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.create({
        data: {
          name: input.name.trim(),
          legalName: input.legalName?.trim() || null,
          email: input.email?.trim() || null,
          phone: input.phone?.trim() || null,
          website: input.website?.trim() || null,
          taxId: input.taxId?.trim() || null,
          registrationNumber: input.registrationNumber?.trim() || null,
          address: input.address?.trim() || null,
          city: input.city?.trim() || null,
          state: input.state?.trim() || null,
          country: input.country?.trim() || null,
          postalCode: input.postalCode?.trim() || null,
          status: "ACTIVE",
        },
      });

      const buyerVendor = await tx.buyerVendor.create({
        data: {
          buyerOrganizationId,
          vendorId: vendor.id,
          status: "ACTIVE",
        },
      });

      return {
        ...vendor,
        buyerVendorStatus: buyerVendor.status,
        buyerOrganizationId: buyerVendor.buyerOrganizationId,
      };
    });
  }

  static async findVendorsByBuyer(params: {
    buyerOrganizationId: string;
    search?: string;
    statusFilter?: string;
  }) {
    const { buyerOrganizationId, search, statusFilter } = params;

    const whereBuyerVendor: any = { buyerOrganizationId };
    if (statusFilter && statusFilter !== "ALL") {
      whereBuyerVendor.status = statusFilter;
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      whereBuyerVendor.vendor = {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { email: { contains: term, mode: "insensitive" } },
          { legalName: { contains: term, mode: "insensitive" } },
        ],
      };
    }

    const buyerVendors = await prisma.buyerVendor.findMany({
      where: whereBuyerVendor,
      include: {
        vendor: {
          include: {
            contacts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return buyerVendors.map((bv) => ({
      ...bv.vendor,
      buyerVendorStatus: bv.status,
      buyerOrganizationId: bv.buyerOrganizationId,
    }));
  }

  static async findBuyerVendor(buyerOrganizationId: string, vendorId: string) {
    const bv = await prisma.buyerVendor.findUnique({
      where: {
        buyerOrganizationId_vendorId: {
          buyerOrganizationId,
          vendorId,
        },
      },
      include: {
        vendor: {
          include: {
            contacts: true,
          },
        },
      },
    });

    if (!bv) return null;

    return {
      ...bv.vendor,
      buyerVendorStatus: bv.status,
      buyerOrganizationId: bv.buyerOrganizationId,
    };
  }

  static async updateVendor(vendorId: string, input: UpdateVendorInput) {
    return prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...(input.name && { name: input.name.trim() }),
        ...(input.legalName !== undefined && { legalName: input.legalName?.trim() || null }),
        ...(input.email !== undefined && { email: input.email?.trim() || null }),
        ...(input.phone !== undefined && { phone: input.phone?.trim() || null }),
        ...(input.website !== undefined && { website: input.website?.trim() || null }),
        ...(input.taxId !== undefined && { taxId: input.taxId?.trim() || null }),
        ...(input.registrationNumber !== undefined && { registrationNumber: input.registrationNumber?.trim() || null }),
        ...(input.address !== undefined && { address: input.address?.trim() || null }),
        ...(input.city !== undefined && { city: input.city?.trim() || null }),
        ...(input.state !== undefined && { state: input.state?.trim() || null }),
        ...(input.country !== undefined && { country: input.country?.trim() || null }),
        ...(input.postalCode !== undefined && { postalCode: input.postalCode?.trim() || null }),
      },
      include: {
        contacts: true,
      },
    });
  }

  static async updateBuyerVendorStatus(buyerOrganizationId: string, vendorId: string, status: string) {
    const updatedBv = await prisma.buyerVendor.update({
      where: {
        buyerOrganizationId_vendorId: {
          buyerOrganizationId,
          vendorId,
        },
      },
      data: { status },
      include: {
        vendor: {
          include: { contacts: true },
        },
      },
    });

    return {
      ...updatedBv.vendor,
      buyerVendorStatus: updatedBv.status,
      buyerOrganizationId: updatedBv.buyerOrganizationId,
    };
  }

  // --- CONTACTS ---

  static async addContact(vendorId: string, input: VendorContactInput) {
    return prisma.vendorContact.create({
      data: {
        vendorId,
        name: input.name.trim(),
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        designation: input.designation?.trim() || null,
      },
    });
  }

  static async getContacts(vendorId: string) {
    return prisma.vendorContact.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateContact(contactId: string, vendorId: string, input: VendorContactInput) {
    const contact = await prisma.vendorContact.findFirst({
      where: { id: contactId, vendorId },
    });
    if (!contact) return null;

    return prisma.vendorContact.update({
      where: { id: contactId },
      data: {
        name: input.name.trim(),
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        designation: input.designation?.trim() || null,
      },
    });
  }

  static async deleteContact(contactId: string, vendorId: string) {
    const contact = await prisma.vendorContact.findFirst({
      where: { id: contactId, vendorId },
    });
    if (!contact) return null;

    return prisma.vendorContact.delete({
      where: { id: contactId },
    });
  }

  // --- INVITATION & VENDOR AUTHENTICATION ---

  static async createVendorInvitation(params: {
    buyerOrganizationId: string;
    vendorId: string;
    email: string;
    name: string;
  }) {
    const { buyerOrganizationId, vendorId, email, name } = params;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return prisma.vendorInvitation.create({
      data: {
        token,
        buyerOrganizationId,
        vendorId,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        expiresAt,
      },
      include: {
        vendor: true,
        buyerOrganization: true,
      },
    });
  }

  static async findVendorInvitationByToken(token: string) {
    return prisma.vendorInvitation.findUnique({
      where: { token },
      include: {
        vendor: true,
        buyerOrganization: true,
      },
    });
  }

  static async acceptVendorInvitation(params: {
    invitationId: string;
    userId: string;
    vendorId: string;
    buyerOrganizationId: string;
  }) {
    const { invitationId, userId, vendorId, buyerOrganizationId } = params;

    return prisma.$transaction(async (tx) => {
      await tx.vendorInvitation.update({
        where: { id: invitationId },
        data: { usedAt: new Date() },
      });

      const vendorUser = await tx.vendorUser.upsert({
        where: { userId },
        create: {
          userId,
          vendorId,
          role: "VENDOR_ADMIN",
        },
        update: {
          vendorId,
          role: "VENDOR_ADMIN",
        },
      });

      await tx.buyerVendor.update({
        where: {
          buyerOrganizationId_vendorId: {
            buyerOrganizationId,
            vendorId,
          },
        },
        data: { status: "ACTIVE" },
      });

      await tx.vendor.update({
        where: { id: vendorId },
        data: { status: "ACTIVE" },
      });

      return vendorUser;
    });
  }

  static async findVendorUserByUserId(userId: string) {
    return prisma.vendorUser.findUnique({
      where: { userId },
      include: {
        vendor: true,
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }
}
