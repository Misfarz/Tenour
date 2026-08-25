import { prisma } from "../../infrastructure/database/prisma/prisma.client";

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        memberships: {
          include: {
            organization: true,
            role: true,
            department: true,
          },
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            organization: true,
            role: true,
            department: true,
          },
        },
      },
    });
  }

  static async createUser(data: { email: string; password: string; name: string }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        name: data.name.trim(),
      },
    });
  }

  static async updatePassword(id: string, password: string) {
    return prisma.user.update({
      where: { id },
      data: { password },
    });
  }
}
