import { UserRepository } from "../../users/user.repository";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "../../../shared/utils/jwt.utils";

export class RefreshTokenUseCase {
  static async execute(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      const user = await UserRepository.findById(payload.userId);

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
}
