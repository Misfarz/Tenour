import { prisma } from "../../../../infrastructure/database/prisma/prisma.client";
import { UpdateOrgSettingsInput } from "../org-settings.schemas";

export class GetOrgSettingsUseCase {
  static async execute(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl,
      createdAt: org.createdAt,
    };
  }
}

export class UpdateOrgSettingsUseCase {
  static async execute(organizationId: string, input: UpdateOrgSettingsInput) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: input.name.trim(),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      logoUrl: updated.logoUrl,
    };
  }
}
