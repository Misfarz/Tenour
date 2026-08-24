import { UpdateOrgUserRoleInput } from "../org-users.schemas";
import { OrgUsersRepository } from "../org-users.repository";

export class UpdateOrgUserRoleUseCase {
  static async execute(organizationId: string, targetId: string, input: UpdateOrgUserRoleInput) {
    const member = await OrgUsersRepository.findMemberByIdAndOrg(targetId, organizationId);
    if (!member) {
      throw new Error("User not found in your organization");
    }

    // Protection against demoting the last ORG_ADMIN
    if (member.role.name === "ORG_ADMIN" && input.role !== "ORG_ADMIN") {
      const activeAdmins = await OrgUsersRepository.countActiveAdmins(organizationId);
      if (activeAdmins <= 1) {
        throw new Error(
          "Cannot demote the only Organization Admin. Promote another member to ORG_ADMIN first."
        );
      }
    }

    const newRole = await OrgUsersRepository.findOrCreateRole(organizationId, input.role);
    const updated = await OrgUsersRepository.updateMemberRole(member.id, newRole.id);

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
