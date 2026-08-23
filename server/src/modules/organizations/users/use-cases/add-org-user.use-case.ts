import { AddOrgUserInput } from "../org-users.schemas";
import { OrgUsersRepository } from "../org-users.repository";
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

    const member = await OrgUsersRepository.addMemberToOrg({
      organizationId,
      name: input.name,
      email: input.email,
      password: input.password,
      roleName: input.role,
      departmentId: input.departmentId,
    });

    return {
      id: member.id,
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
      role: member.role.name,
      department: member.department ? { id: member.department.id, name: member.department.name } : null,
      status: member.status,
    };
  }
}
