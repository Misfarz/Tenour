import { CreateDepartmentInput } from "../department.schemas";
import { DepartmentRepository } from "../department.repository";

export class CreateDepartmentUseCase {
  static async execute(organizationId: string, input: CreateDepartmentInput) {
    const existing = await DepartmentRepository.findDepartmentsByOrg(organizationId);
    const nameLower = input.name.trim().toLowerCase();

    if (existing.some((d) => d.name.toLowerCase() === nameLower)) {
      throw new Error("Department with this name already exists in your organization");
    }

    return DepartmentRepository.createDepartment(organizationId, input.name);
  }
}
