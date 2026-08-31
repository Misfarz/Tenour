import { VendorRepository } from "../vendor.repository";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";

export class GetVendorDetailUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    vendorId: string;
  }) {
    const { buyerOrganizationId, vendorId } = params;

    const vendor = await VendorRepository.findBuyerVendor(buyerOrganizationId, vendorId);
    if (vendor) {
      return vendor;
    }

    // Check if vendor exists as PLATFORM_REGISTERED
    const platformVendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        contacts: true,
        vendorUsers: true,
        buyerVendors: {
          where: { buyerOrganizationId },
        },
      },
    });

    if (platformVendor && platformVendor.source === "PLATFORM_REGISTERED") {
      const bv = platformVendor.buyerVendors?.[0];
      return {
        ...platformVendor,
        buyerVendorStatus: bv ? bv.status : platformVendor.status,
        buyerOrganizationId,
        hasVendorPortal: true,
        latestInvitation: null,
      };
    }

    throw new Error("Vendor not found in your organization");
  }
}
