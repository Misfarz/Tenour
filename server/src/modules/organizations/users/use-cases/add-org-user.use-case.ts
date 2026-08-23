import { AddOrgUserInput } from "../org-users.schemas";
import { OrgInvitationRepository } from "../../invitations/org-invitation.repository";
import { prisma } from "../../../../infrastructure/database/prisma/prisma.client";

export class AddOrgUserUseCase {
  static async execute(organizationId: string, input: AddOrgUserInput) {
    if (input.departmentId) {
      const dept = await prisma.department.findFirst({
        where: {
          id: input.departmentId,
          organizationId,
        },
      });

      if (!dept) {
        throw new Error("Department not found in your organization");
      }
    }

    const invitation = await OrgInvitationRepository.createInvitation({
      organizationId,
      name: input.name,
      email: input.email,
      roleName: input.role,
      departmentId: input.departmentId,
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const invitationUrl = `${clientUrl}/buyer/accept-invitation?token=${invitation.token}`;

    return {
      id: invitation.id,
      email: invitation.email,
      name: invitation.name,
      role: invitation.role,
      organizationName: invitation.organizationName,
      status: invitation.status,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
      invitationUrl,
    };
  }
}
