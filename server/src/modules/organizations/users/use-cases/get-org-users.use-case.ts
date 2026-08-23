import { OrgUsersRepository } from "../org-users.repository";

export class GetOrgUsersUseCase {
  static async execute(organizationId: string) {
    const members = await OrgUsersRepository.findMembersByOrganization(organizationId);

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role.name,
      roleId: m.roleId,
      department: m.department ? { id: m.department.id, name: m.department.name } : null,
      departmentId: m.departmentId,
      status: m.status,
      createdAt: m.createdAt,
    }));
  }
}
