import { OrgInvitationRepository } from "../../organizations/invitations/org-invitation.repository";
import { hashPassword } from "../../../shared/utils/password.utils";

export class AcceptInvitationUseCase {
  static async execute(token: string, password: string) {
    if (!token) {
      throw new Error("Invitation token is required");
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const hashedPassword = await hashPassword(password);
    const updatedMember = await OrgInvitationRepository.acceptInvitation(token, hashedPassword);

    return {
      userId: updatedMember.userId,
      email: updatedMember.user.email,
      name: updatedMember.user.name,
      organizationName: updatedMember.organization.name,
      role: updatedMember.role.name,
      status: updatedMember.status,
    };
  }
}
