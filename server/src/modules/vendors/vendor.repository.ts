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
    input: CreateVendorInput & { source?: string };
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
          source: input.source || "MANUALLY_ADDED",
        },
      });

      const buyerVendor = await tx.buyerVendor.create({
        data: {
          buyerOrganizationId,
          vendorId: vendor.id,
          status: "ACTIVE",
        },
      });

      let latestInvitation = null;
      if (input.email && input.email.trim()) {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        latestInvitation = await tx.vendorInvitation.create({
          data: {
            token,
            buyerOrganizationId,
            vendorId: vendor.id,
            email: input.email.trim().toLowerCase(),
            name: input.name.trim(),
            expiresAt,
          },
        });
      }

      return {
        ...vendor,
        buyerVendorStatus: buyerVendor.status,
        buyerOrganizationId: buyerVendor.buyerOrganizationId,
        hasVendorPortal: vendor.source === "PLATFORM_REGISTERED",
        latestInvitation: latestInvitation
          ? {
              id: latestInvitation.id,
              token: latestInvitation.token,
              email: latestInvitation.email,
              name: latestInvitation.name,
              usedAt: latestInvitation.usedAt,
              expiresAt: latestInvitation.expiresAt,
            }
          : null,
      };
    });
  }

  static async findByEmailOrName(email?: string, name?: string) {
    if (!email && !name) return null;
    const OR: any[] = [];
    if (email && email.trim()) {
      const cleanEmail = email.trim();
      OR.push({ email: { equals: cleanEmail, mode: "insensitive" } });
      OR.push({ contacts: { some: { email: { equals: cleanEmail, mode: "insensitive" } } } });
      OR.push({ vendorUsers: { some: { user: { email: { equals: cleanEmail, mode: "insensitive" } } } } });
    }
    if (name && name.trim()) {
      OR.push({ name: { equals: name.trim(), mode: "insensitive" } });
    }

    return prisma.vendor.findFirst({
      where: {
        source: "PLATFORM_REGISTERED",
        status: "ACTIVE",
        OR,
      },
      include: {
        contacts: true,
        vendorUsers: true,
      },
    });
  }

  static async linkBuyerVendor(buyerOrganizationId: string, vendorId: string) {
    const buyerVendor = await prisma.buyerVendor.upsert({
      where: {
        buyerOrganizationId_vendorId: {
          buyerOrganizationId,
          vendorId,
        },
      },
      create: {
        buyerOrganizationId,
        vendorId,
        status: "ACTIVE",
      },
      update: {
        status: "ACTIVE",
      },
      include: {
        vendor: {
          include: {
            contacts: true,
            vendorUsers: true,
          },
        },
      },
    });

    return {
      ...buyerVendor.vendor,
      buyerVendorStatus: buyerVendor.status,
      buyerOrganizationId: buyerVendor.buyerOrganizationId,
      hasVendorPortal: buyerVendor.vendor.vendorUsers.length > 0 || buyerVendor.vendor.source === "PLATFORM_REGISTERED",
    };
  }

  static async findDiscoverableVendors(params: {
    buyerOrganizationId: string;
    search?: string;
    sourceFilter?: "ALL" | "PLATFORM_REGISTERED" | "MANUALLY_ADDED";
    statusFilter?: string;
  }) {
    const { buyerOrganizationId, search, sourceFilter, statusFilter } = params;

    // Search condition helper
    const getSearchWhere = () => {
      if (!search || !search.trim()) return {};
      const term = search.trim();
      return {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { email: { contains: term, mode: "insensitive" } },
          { legalName: { contains: term, mode: "insensitive" } },
        ],
      };
    };

    const searchWhere = getSearchWhere();

    // 1. Fetch Manual Vendors for this Buyer Organization
    let manualVendors: any[] = [];
    if (!sourceFilter || sourceFilter === "ALL" || sourceFilter === "MANUALLY_ADDED") {
      const whereBuyerVendor: any = { buyerOrganizationId };
      if (statusFilter && statusFilter !== "ALL") {
        whereBuyerVendor.status = statusFilter;
      }
      if (search && search.trim().length > 0) {
        whereBuyerVendor.vendor = searchWhere;
      }

      const buyerVendors = await prisma.buyerVendor.findMany({
        where: whereBuyerVendor,
        include: {
          vendor: {
            include: {
              contacts: true,
              vendorUsers: true,
              vendorInvitations: {
                where: { buyerOrganizationId },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      manualVendors = buyerVendors.map((bv) => {
        const latestInvite = (bv.vendor as any).vendorInvitations?.[0];
        return {
          ...bv.vendor,
          buyerVendorStatus: bv.status,
          buyerOrganizationId: bv.buyerOrganizationId,
          hasVendorPortal: bv.vendor.vendorUsers.length > 0 || bv.vendor.source === "PLATFORM_REGISTERED",
          latestInvitation: latestInvite
            ? {
                id: latestInvite.id,
                token: latestInvite.token,
                email: latestInvite.email,
                name: latestInvite.name,
                usedAt: latestInvite.usedAt,
                expiresAt: latestInvite.expiresAt,
              }
            : null,
        };
      });
    }

    // 2. Fetch Platform Registered Vendors (Publicly discoverable)
    let platformVendors: any[] = [];
    if (!sourceFilter || sourceFilter === "ALL" || sourceFilter === "PLATFORM_REGISTERED") {
      const wherePlatform: any = {
        source: "PLATFORM_REGISTERED",
        ...searchWhere,
      };
      if (statusFilter && statusFilter !== "ALL") {
        wherePlatform.status = statusFilter;
      }

      const foundPlatform = await prisma.vendor.findMany({
        where: wherePlatform,
        include: {
          contacts: true,
          vendorUsers: true,
          buyerVendors: {
            where: { buyerOrganizationId },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      platformVendors = foundPlatform.map((v) => {
        const bv = v.buyerVendors?.[0];
        return {
          ...v,
          buyerVendorStatus: bv ? bv.status : v.status,
          buyerOrganizationId,
          hasVendorPortal: true,
          latestInvitation: null,
        };
      });
    }

    // 3. Combine and Deduplicate by Vendor ID
    const combinedMap = new Map<string, any>();
    for (const v of manualVendors) {
      combinedMap.set(v.id, v);
    }
    for (const v of platformVendors) {
      if (!combinedMap.has(v.id)) {
        combinedMap.set(v.id, v);
      }
    }

    return Array.from(combinedMap.values());
  }

  static async findVendorsByBuyer(params: {
    buyerOrganizationId: string;
    search?: string;
    sourceFilter?: "ALL" | "PLATFORM_REGISTERED" | "MANUALLY_ADDED";
    statusFilter?: string;
  }) {
    return VendorRepository.findDiscoverableVendors(params);
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
            vendorInvitations: {
              where: { buyerOrganizationId },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!bv) return null;

    const latestInvite = (bv.vendor as any).vendorInvitations?.[0];
    return {
      ...bv.vendor,
      buyerVendorStatus: bv.status,
      buyerOrganizationId: bv.buyerOrganizationId,
      latestInvitation: latestInvite
        ? {
            id: latestInvite.id,
            token: latestInvite.token,
            email: latestInvite.email,
            name: latestInvite.name,
            usedAt: latestInvite.usedAt,
            expiresAt: latestInvite.expiresAt,
          }
        : null,
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

    await prisma.vendor.update({
      where: { id: vendorId },
      data: { status },
    });

    return {
      ...updatedBv.vendor,
      status,
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
