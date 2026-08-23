import { UserRepository } from "../../users/user.repository";

export class GetCurrentUserUseCase {
  static async execute(userId: string) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const primaryMembership = user.memberships[0];

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      organization: primaryMembership?.organization
        ? {
            id: primaryMembership.organization.id,
            name: primaryMembership.organization.name,
            slug: primaryMembership.organization.slug,
          }
        : null,
      role: primaryMembership?.role ? primaryMembership.role.name : null,
      memberships: user.memberships,
    };
  }
}
