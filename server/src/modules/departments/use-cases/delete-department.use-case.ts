import { DepartmentRepository } from "../department.repository";

export class DeleteDepartmentUseCase {
  static async execute(organizationId: string, departmentId: string) {
    const dept = await DepartmentRepository.findDepartmentByIdAndOrg(departmentId, organizationId);
    if (!dept) {
      throw new Error("Department not found in your organization");
    }

    return DepartmentRepository.deleteDepartment(dept.id);
  }
}
