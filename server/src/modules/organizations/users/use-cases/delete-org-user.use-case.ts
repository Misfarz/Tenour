import { OrgUsersRepository } from "../org-users.repository";

export class DeleteOrgUserUseCase {
  static async execute(organizationId: string, targetId: string) {
    const member = await OrgUsersRepository.findMemberByIdAndOrg(targetId, organizationId);
    if (!member) {
      throw new Error("User not found in your organization");
    }

    if (member.role.name === "ORG_ADMIN") {
      const totalAdmins = await OrgUsersRepository.countTotalAdmins(organizationId);
      if (totalAdmins <= 1) {
        throw new Error("Cannot delete the only organization admin");
      }
    }

    await OrgUsersRepository.deleteMember(member.id);

    return {
      id: member.id,
      name: member.user.name,
      email: member.user.email,
    };
  }
}
