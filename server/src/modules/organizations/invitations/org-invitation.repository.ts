import crypto from "crypto";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";
import { hashPassword } from "../../../shared/utils/password.utils";

export class OrgInvitationRepository {
  static async createInvitation(params: {
    organizationId: string;
    name: string;
    email: string;
    roleName: string;
    departmentId?: string | null;
  }) {
    const emailNormalized = params.email.toLowerCase().trim();

    // Find or create user with unusable dummy password if new
    let user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      const dummyPassword = await hashPassword(`UNUSABLE_INVITE_PWD_${crypto.randomBytes(16).toString("hex")}`);
      user = await prisma.user.create({
        data: {
          name: params.name.trim(),
          email: emailNormalized,
          password: dummyPassword,
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
      if (existingMember.status === "ACTIVE") {
        throw new Error("User is already an active member of this organization");
      }
    }

    // Find or create role
    let role = await prisma.role.findFirst({
      where: { name: params.roleName, organizationId: params.organizationId },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: params.roleName,
          description: `${params.roleName} Role`,
          organizationId: params.organizationId,
        },
      });
    }

    // Create or update organization member with status INVITED
    const member = existingMember
      ? await prisma.organizationMember.update({
          where: { id: existingMember.id },
          data: {
            roleId: role.id,
            departmentId: params.departmentId || null,
            status: "INVITED",
          },
          include: { user: true, role: true, organization: true },
        })
      : await prisma.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: params.organizationId,
            roleId: role.id,
            departmentId: params.departmentId || null,
            status: "INVITED",
          },
          include: { user: true, role: true, organization: true },
        });

    // Delete any previous unused invitation for this member
    await prisma.invitation.deleteMany({
      where: { memberId: member.id, usedAt: null },
    });

    // Generate secure invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000); // 48 hours

    const invitation = await prisma.invitation.create({
      data: {
        token,
        organizationId: params.organizationId,
        memberId: member.id,
        email: emailNormalized,
        roleId: role.id,
        expiresAt,
      },
      include: {
        organization: true,
        member: { include: { user: true } },
        role: true,
      },
    });

    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      name: invitation.member.user.name,
      organizationId: invitation.organizationId,
      organizationName: invitation.organization.name,
      role: invitation.role.name,
      expiresAt: invitation.expiresAt,
      status: member.status,
    };
  }

  static async findByToken(token: string) {
    return prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: true,
        member: { include: { user: true } },
        role: true,
      },
    });
  }

  static async acceptInvitation(token: string, newPasswordHash: string) {
    const invitation = await this.findByToken(token);

    if (!invitation) {
      throw new Error("Invalid invitation token");
    }

    if (invitation.usedAt) {
      throw new Error("Invitation token has already been used");
    }

    if (new Date() > invitation.expiresAt) {
      throw new Error("Invitation token has expired");
    }

    // Single transaction: Update user password, activate member, mark token as used
    return prisma.$transaction(async (tx) => {
      // 1. Update user password
      await tx.user.update({
        where: { id: invitation.member.userId },
        data: { password: newPasswordHash },
      });

      // 2. Set member status to ACTIVE
      const updatedMember = await tx.organizationMember.update({
        where: { id: invitation.memberId },
        data: { status: "ACTIVE" },
        include: {
          user: true,
          organization: true,
          role: true,
        },
      });

      // 3. Mark invitation as used
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });

      return updatedMember;
    });
  }
}
