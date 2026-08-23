import { Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/database/prisma/prisma.client";

export class OrganizationRepository {
  static async createOrganizationWithAdmin(userId: string, orgName: string) {
    const baseSlug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const slug = `${baseSlug || "org"}-${Date.now().toString(36)}`;

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          slug,
        },
      });

      const role = await tx.role.create({
        data: {
          name: "ORG_ADMIN",
          description: "Organization Administrator",
          organizationId: organization.id,
        },
      });

      const member = await tx.organizationMember.create({
        data: {
          userId,
          organizationId: organization.id,
          roleId: role.id,
          status: "ACTIVE",
        },
        include: {
          organization: true,
          role: true,
        },
      });

      return {
        organization,
        role: role.name,
        member,
      };
    });
  }
}
