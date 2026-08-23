import { CreateOrganizationInput } from "./organization.schemas";
import { CreateOrganizationUseCase } from "./use-cases/create-organization.use-case";

export class OrganizationService {
  static async createOrganization(userId: string, input: CreateOrganizationInput) {
    return CreateOrganizationUseCase.execute(userId, input);
  }
}
