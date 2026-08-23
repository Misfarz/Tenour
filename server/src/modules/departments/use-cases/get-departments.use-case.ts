import { DepartmentRepository } from "../department.repository";

export class GetDepartmentsUseCase {
  static async execute(organizationId: string) {
    const departments = await DepartmentRepository.findDepartmentsByOrg(organizationId);
    return departments.map((d) => ({
      id: d.id,
      name: d.name,
      memberCount: d._count.members,
      createdAt: d.createdAt,
    }));
  }
}
