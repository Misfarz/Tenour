import { Prisma } from "@prisma/client";
import { prisma } from "../../infrastructure/database/prisma/prisma.client";
import { CreateOrganizationInput } from "./organization.schemas";

export class OrganizationService {
  static async createOrganization(userId: string, input: CreateOrganizationInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const orgName = input.name.trim();
    if (!orgName) {
      throw new Error("Organization name missing");
    }

    const baseSlug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const uniqueSuffix = Date.now().toString(36);
    const slug = `${baseSlug || "org"}-${uniqueSuffix}`;

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
          userId: user.id,
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
