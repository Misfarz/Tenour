import { LoginInput } from "../auth.schemas";
import { UserRepository } from "../../users/user.repository";
import { verifyPassword } from "../../../shared/utils/password.utils";
import { generateAccessToken, generateRefreshToken } from "../../../shared/utils/jwt.utils";

export class LoginUserUseCase {
  static async execute(input: LoginInput) {
    const user = await UserRepository.findByEmail(input.email);
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
}
