import argon2 from "argon2";
import { AcceptVendorInvitationInput } from "../vendor.schemas";
import { VendorRepository } from "../vendor.repository";
import { UserRepository } from "../../users/user.repository";

export class AcceptVendorInvitationUseCase {
  static async execute(input: AcceptVendorInvitationInput) {
    const { token, password } = input;

    const invitation = await VendorRepository.findVendorInvitationByToken(token);
    if (!invitation) {
      throw new Error("Invalid or expired invitation token");
    }

    if (invitation.usedAt) {
      throw new Error("This invitation token has already been used");
    }

    if (new Date() > invitation.expiresAt) {
      throw new Error("This invitation token has expired");
    }

    const hashedPassword = await argon2.hash(password);

    // Create user or update password if existing
    const existingUser = await UserRepository.findByEmail(invitation.email);
    let targetUserId: string;
    let targetEmail: string;
    let targetName: string;

    if (!existingUser) {
      const newUser = await UserRepository.createUser({
        email: invitation.email,
        password: hashedPassword,
        name: invitation.name,
      });
      targetUserId = newUser.id;
      targetEmail = newUser.email;
      targetName = newUser.name;
    } else {
      const updatedUser = await UserRepository.updatePassword(existingUser.id, hashedPassword);
      targetUserId = updatedUser.id;
      targetEmail = updatedUser.email;
      targetName = updatedUser.name;
    }

    await VendorRepository.acceptVendorInvitation({
      invitationId: invitation.id,
      userId: targetUserId,
      vendorId: invitation.vendorId,
      buyerOrganizationId: invitation.buyerOrganizationId,
    });

    return {
      userId: targetUserId,
      email: targetEmail,
      name: targetName,
      vendorId: invitation.vendorId,
      vendorName: invitation.vendor.name,
    };
  }
}
