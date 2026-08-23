import { OrgInvitationRepository } from "../../organizations/invitations/org-invitation.repository";

export class VerifyInvitationUseCase {
  static async execute(token: string) {
    if (!token) {
      throw new Error("Invitation token is required");
    }

    const invitation = await OrgInvitationRepository.findByToken(token);

    if (!invitation) {
      throw new Error("Invalid invitation token");
    }

    if (invitation.usedAt) {
      throw new Error("Invitation token has already been used");
    }

    if (new Date() > invitation.expiresAt) {
      throw new Error("Invitation token has expired");
    }

    return {
      email: invitation.email,
      name: invitation.member.user.name,
      organizationName: invitation.organization.name,
      role: invitation.role.name,
      expiresAt: invitation.expiresAt,
    };
  }
}
