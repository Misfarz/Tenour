import { InviteVendorInput } from "../vendor.schemas";
import { VendorRepository } from "../vendor.repository";
import { BuyerRole } from "../../../shared/constants/roles";
import { sendEmail } from "../../../shared/utils/email.utils";

export class InviteVendorUseCase {
  static async execute(params: {
    buyerOrganizationId: string;
    vendorId: string;
    role: string;
    input: InviteVendorInput;
  }) {
    const { buyerOrganizationId, vendorId, role, input } = params;

    const allowedRoles = [BuyerRole.ORG_ADMIN, BuyerRole.PROCUREMENT];
    if (!allowedRoles.includes(role as BuyerRole)) {
      throw new Error("Forbidden: Only Organization Admins and Procurement managers can invite vendors");
    }

    const vendor = await VendorRepository.findBuyerVendor(buyerOrganizationId, vendorId);
    if (!vendor) {
      throw new Error("Vendor not found in your organization");
    }

    const invitation = await VendorRepository.createVendorInvitation({
      buyerOrganizationId,
      vendorId,
      email: input.email,
      name: input.name,
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const inviteLink = `${clientUrl}/vendor/accept-invitation?token=${invitation.token}`;

    const htmlBody = `
      <h2>Vendor Portal Invitation — ${invitation.buyerOrganization.name}</h2>
      <p>Hello ${invitation.name},</p>
      <p>${invitation.buyerOrganization.name} has invited <strong>${invitation.vendor.name}</strong> to join their Tenour Vendor Portal.</p>
      <p>Click the link below to set your password and access your vendor dashboard:</p>
      <p><a href="${inviteLink}" style="display:inline-block;padding:10px 20px;background:#2383E2;color:#ffffff;text-decoration:none;border-radius:6px;">Accept Vendor Invitation</a></p>
      <p>Or copy this link: ${inviteLink}</p>
    `;

    await sendEmail({
      to: invitation.email,
      subject: `Vendor Invitation from ${invitation.buyerOrganization.name}`,
      html: htmlBody,
    });

    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      name: invitation.name,
      vendorName: invitation.vendor.name,
      buyerOrganizationName: invitation.buyerOrganization.name,
      expiresAt: invitation.expiresAt,
    };
  }
}
