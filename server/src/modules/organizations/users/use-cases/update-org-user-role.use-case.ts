import { UpdateOrgUserRoleInput } from "../org-users.schemas";
import { OrgUsersRepository } from "../org-users.repository";

export class UpdateOrgUserRoleUseCase {
  static async execute(organizationId: string, targetId: string, input: UpdateOrgUserRoleInput) {
    const member = await OrgUsersRepository.findMemberByIdAndOrg(targetId, organizationId);
    if (!member) {
      throw new Error("User not found in your organization");
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
