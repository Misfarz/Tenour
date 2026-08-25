import { prisma } from "../../infrastructure/database/prisma/prisma.client";
import { CreateVendorInput } from "./vendor.schemas";

export class VendorRepository {
  static async createVendorWithBuyer(params: {
    buyerOrganizationId: string;
    input: CreateVendorInput;
  }) {
    const { buyerOrganizationId, input } = params;

    return prisma.$transaction(async (tx) => {
      // 1. Create global Vendor record
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

      // 2. Link Vendor to Buyer Organization via BuyerVendor join model
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

  static async findBuyerVendor(buyerOrganizationId: string, vendorId: string) {
    return prisma.buyerVendor.findUnique({
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
  }

  static async findVendorsByBuyer(buyerOrganizationId: string) {
    const buyerVendors = await prisma.buyerVendor.findMany({
      where: { buyerOrganizationId },
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
}
