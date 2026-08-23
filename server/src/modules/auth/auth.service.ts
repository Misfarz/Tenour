import { RegisterInput, LoginInput } from "./auth.schemas";
import { RegisterUserUseCase } from "./use-cases/register-user.use-case";
import { LoginUserUseCase } from "./use-cases/login-user.use-case";
import { RefreshTokenUseCase } from "./use-cases/refresh-token.use-case";
import { GetCurrentUserUseCase } from "./use-cases/get-current-user.use-case";

export class AuthService {
  static async register(input: RegisterInput) {
    return RegisterUserUseCase.execute(input);
  }

  static async login(input: LoginInput) {
    return LoginUserUseCase.execute(input);
  }

  static async refreshToken(token: string) {
    return RefreshTokenUseCase.execute(token);
  }

  static async getUserById(userId: string) {
    return GetCurrentUserUseCase.execute(userId);
  }
}
