import { prisma } from "../../infrastructure/database/prisma/prisma.client";
import { RegisterInput, LoginInput } from "./auth.schemas";
import { hashPassword, verifyPassword } from "../../shared/utils/password.utils";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../shared/utils/jwt.utils";

export class AuthService {
  static async register(input: RegisterInput) {
    const emailNormalized = input.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: emailNormalized,
        password: hashedPassword,
        name: input.name.trim(),
      },
    });

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      organization: null,
      role: null,
      memberships: [],
      accessToken,
      refreshToken,
    };
  }

  static async login(input: LoginInput) {
    const emailNormalized = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
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

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await verifyPassword(user.password, input.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

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
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const tokenPayload = { userId: user.id, email: user.email };
      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      if (error.message === "User not found") {
        throw error;
      }
      throw new Error("Invalid or expired token");
    }
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
