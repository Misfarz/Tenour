import { prisma } from "../../infrastructure/database/prisma/prisma.client";

export class DepartmentRepository {
  static async findDepartmentsByOrg(organizationId: string) {
    return prisma.department.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  static async findDepartmentByIdAndOrg(departmentId: string, organizationId: string) {
    return prisma.department.findFirst({
      where: {
        id: departmentId,
        organizationId,
      },
    });
  }

  static async createDepartment(organizationId: string, name: string) {
    return prisma.department.create({
      data: {
        name: name.trim(),
        organizationId,
      },
    });
  }

  static async updateDepartment(departmentId: string, name: string) {
    return prisma.department.update({
      where: { id: departmentId },
      data: { name: name.trim() },
    });
  }

  static async deleteDepartment(departmentId: string) {
    return prisma.department.delete({
      where: { id: departmentId },
    });
  }
}
