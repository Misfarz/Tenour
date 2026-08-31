import { CreateRfqInput } from "../rfq.schemas";
import { RfqRepository } from "../rfq.repository";
import { PurchaseRequestRepository } from "../../purchase-requests/purchase-request.repository";
import { VendorRepository } from "../../vendors/vendor.repository";
import { BuyerRole } from "../../../shared/constants/roles";

import { prisma } from "../../../infrastructure/database/prisma/prisma.client";

export class CreateRfqUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    createdById: string;
    role: string;
    input: CreateRfqInput;
  }) {
    const { buyerOrganizationId, createdById, role, input } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can create RFQs");
    }

    // 1. Verify Purchase Request exists and belongs to current org
    const purchaseRequest = await PurchaseRequestRepository.findRequestByIdAndOrg(input.purchaseRequestId, buyerOrganizationId);
    if (!purchaseRequest) {
      throw new Error("Purchase Request not found in your organization");
    }

    // 2. Verify Purchase Request status is APPROVED
    if (purchaseRequest.status !== "APPROVED") {
      throw new Error("Cannot create RFQ: Purchase Request must be APPROVED");
    }

    // 3. Verify selected vendors exist and are ACTIVE
    if (input.vendorIds && input.vendorIds.length > 0) {
      for (const vendorId of input.vendorIds) {
        let buyerVendor: any = await VendorRepository.findBuyerVendor(buyerOrganizationId, vendorId);
        if (!buyerVendor) {
          // Check if vendor exists as PLATFORM_REGISTERED
          const platformVendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
          });
          if (!platformVendor || platformVendor.source !== "PLATFORM_REGISTERED") {
            throw new Error(`Vendor ${vendorId} not found in your organization`);
          }
          if (platformVendor.status !== "ACTIVE") {
            throw new Error(`Cannot select vendor ${platformVendor.name}: Vendor is not ACTIVE`);
          }
          // Automatically link platform vendor to buyer organization
          buyerVendor = await VendorRepository.linkBuyerVendor(buyerOrganizationId, vendorId);
        }

        if (buyerVendor.buyerVendorStatus !== "ACTIVE") {
          throw new Error(`Cannot select vendor ${buyerVendor.name}: Vendor is not ACTIVE`);
        }
      }
    }

    return RfqRepository.createRfq({
      organizationId: buyerOrganizationId,
      createdById,
      input,
    });
  }
}
