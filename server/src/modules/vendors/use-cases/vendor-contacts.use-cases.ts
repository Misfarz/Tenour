import { VendorContactInput } from "../vendor.schemas";
import { VendorRepository } from "../vendor.repository";
import { BuyerRole } from "../../../shared/constants/roles";

export class VendorContactUseCases {
  static async addContact(params: {
    buyerOrganizationId: string;
    vendorId: string;
    role: string;
    input: VendorContactInput;
  }) {
    const { buyerOrganizationId, vendorId, role, input } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can manage contacts");
    }

    const vendor = await VendorRepository.findBuyerVendor(buyerOrganizationId, vendorId);
    if (!vendor) {
      throw new Error("Vendor not found in your organization");
    }

    return VendorRepository.addContact(vendorId, input);
  }

  static async getContacts(params: {
    buyerOrganizationId: string;
    vendorId: string;
  }) {
    const { buyerOrganizationId, vendorId } = params;

    const vendor = await VendorRepository.findBuyerVendor(buyerOrganizationId, vendorId);
    if (!vendor) {
      throw new Error("Vendor not found in your organization");
    }

    return VendorRepository.getContacts(vendorId);
  }

  static async updateContact(params: {
    buyerOrganizationId: string;
    vendorId: string;
    contactId: string;
    role: string;
    input: VendorContactInput;
  }) {
    const { buyerOrganizationId, vendorId, contactId, role, input } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can manage contacts");
    }

    const vendor = await VendorRepository.findBuyerVendor(buyerOrganizationId, vendorId);
    if (!vendor) {
      throw new Error("Vendor not found in your organization");
    }

    const updated = await VendorRepository.updateContact(contactId, vendorId, input);
    if (!updated) {
      throw new Error("Contact not found for this vendor");
    }

    return updated;
  }

  static async deleteContact(params: {
    buyerOrganizationId: string;
    vendorId: string;
    contactId: string;
    role: string;
  }) {
    const { buyerOrganizationId, vendorId, contactId, role } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can manage contacts");
    }

    const vendor = await VendorRepository.findBuyerVendor(buyerOrganizationId, vendorId);
    if (!vendor) {
      throw new Error("Vendor not found in your organization");
    }

    const deleted = await VendorRepository.deleteContact(contactId, vendorId);
    if (!deleted) {
      throw new Error("Contact not found for this vendor");
    }

    return deleted;
  }
}
