import { RegisterInput } from "../auth.schemas";
import { UserRepository } from "../../users/user.repository";
import { hashPassword } from "../../../shared/utils/password.utils";
import { generateAccessToken, generateRefreshToken } from "../../../shared/utils/jwt.utils";

export class RegisterUserUseCase {
  static async execute(input: RegisterInput) {
    const existingUser = await UserRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await UserRepository.createUser({
      email: input.email,
      password: hashedPassword,
      name: input.name,
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
}
