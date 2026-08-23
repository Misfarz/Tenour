import { prisma } from "../../../infrastructure/database/prisma/prisma.client";
import { hashPassword } from "../../../shared/utils/password.utils";

export class OrgUsersRepository {
  static async findMembersByOrganization(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        role: true,
        department: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  static async findMemberByIdAndOrg(targetId: string, organizationId: string) {
    return prisma.organizationMember.findFirst({
      where: {
        organizationId,
        OR: [
          { id: targetId },
          { userId: targetId },
          { invitation: { id: targetId } },
        ],
      },
      include: {
        user: true,
        role: true,
        department: true,
      },
    });
  }

  static async findOrCreateRole(organizationId: string, roleName: string) {
    const existingRole = await prisma.role.findFirst({
      where: {
        name: roleName,
        organizationId,
      },
    });

    if (existingRole) {
      return existingRole;
    }

    return prisma.role.create({
      data: {
        name: roleName,
        description: `${roleName} Role`,
        organizationId,
      },
    });
  }

  static async addMemberToOrg(params: {
    organizationId: string;
    name: string;
    email: string;
    password?: string;
    roleName: string;
    departmentId?: string | null;
  }) {
    const emailNormalized = params.email.toLowerCase().trim();

    // Check or create user
    let user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      const defaultPassword = params.password || "Password123!";
      const hashedPassword = await hashPassword(defaultPassword);
      user = await prisma.user.create({
        data: {
          name: params.name.trim(),
          email: emailNormalized,
          password: hashedPassword,
        },
      });
    }

    // Check existing membership in this organization
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: params.organizationId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new Error("User already belongs to this organization");
    }

    const role = await this.findOrCreateRole(params.organizationId, params.roleName);

    return prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: params.organizationId,
        roleId: role.id,
        departmentId: params.departmentId || null,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        role: true,
        department: true,
      },
    });
  }

  static async updateMemberRole(memberId: string, roleId: string) {
    return prisma.organizationMember.update({
      where: { id: memberId },
      data: { roleId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        role: true,
        department: true,
      },
    });
  }

  static async updateMemberStatus(memberId: string, status: string) {
    return prisma.organizationMember.update({
      where: { id: memberId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        role: true,
        department: true,
      },
    });
  }

  static async deleteMember(memberId: string) {
    return prisma.organizationMember.delete({
      where: { id: memberId },
    });
  }

  static async countActiveAdmins(organizationId: string) {
    const adminRoles = await prisma.role.findMany({
      where: {
        organizationId,
        name: "ORG_ADMIN",
      },
    });

    const adminRoleIds = adminRoles.map((r) => r.id);

    return prisma.organizationMember.count({
      where: {
        organizationId,
        status: "ACTIVE",
        roleId: { in: adminRoleIds },
      },
    });
  }

  static async countTotalAdmins(organizationId: string) {
    const adminRoles = await prisma.role.findMany({
      where: {
        organizationId,
        name: "ORG_ADMIN",
      },
    });

    const adminRoleIds = adminRoles.map((r) => r.id);

    return prisma.organizationMember.count({
      where: {
        organizationId,
        roleId: { in: adminRoleIds },
      },
    });
  }
}
