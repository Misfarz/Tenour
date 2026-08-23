import { CreateOrganizationInput } from "../organization.schemas";
import { OrganizationRepository } from "../organization.repository";
import { UserRepository } from "../../users/user.repository";

export class CreateOrganizationUseCase {
  static async execute(userId: string, input: CreateOrganizationInput) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const orgName = input.name.trim();
    if (!orgName) {
      throw new Error("Organization name missing");
    }

    return await OrganizationRepository.createOrganizationWithAdmin(userId, orgName);
  }
}
