import { UpdateOrgUserStatusInput } from "../org-users.schemas";
import { OrgUsersRepository } from "../org-users.repository";

export class UpdateOrgUserStatusUseCase {
  static async execute(organizationId: string, targetId: string, input: UpdateOrgUserStatusInput) {
    const member = await OrgUsersRepository.findMemberByIdAndOrg(targetId, organizationId);
    if (!member) {
      throw new Error("User not found in your organization");
    }

    if (input.status === "INACTIVE" && member.role.name === "ORG_ADMIN") {
      const activeAdminsCount = await OrgUsersRepository.countActiveAdmins(organizationId);
      if (activeAdminsCount <= 1) {
        throw new Error("Cannot deactivate the only active organization admin");
      }
    }

    const updated = await OrgUsersRepository.updateMemberStatus(member.id, input.status);

    return {
      id: updated.id,
      userId: updated.userId,
      name: updated.user.name,
      email: updated.user.email,
      role: updated.role.name,
      status: updated.status,
    };
  }
}
