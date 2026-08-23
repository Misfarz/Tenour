import { UpdateDepartmentInput } from "../department.schemas";
import { DepartmentRepository } from "../department.repository";

export class UpdateDepartmentUseCase {
  static async execute(organizationId: string, departmentId: string, input: UpdateDepartmentInput) {
    const dept = await DepartmentRepository.findDepartmentByIdAndOrg(departmentId, organizationId);
    if (!dept) {
      throw new Error("Department not found in your organization");
    }

    return DepartmentRepository.updateDepartment(dept.id, input.name);
  }
}
