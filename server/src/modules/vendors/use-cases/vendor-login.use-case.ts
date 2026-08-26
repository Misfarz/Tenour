import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { VendorLoginInput } from "../vendor.schemas";
import { UserRepository } from "../../users/user.repository";
import { VendorRepository } from "../vendor.repository";

export class VendorLoginUseCase {
  static async execute(input: VendorLoginInput) {
    const { email, password } = input;

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = await argon2.verify(user.password, password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const vendorUser = await VendorRepository.findVendorUserByUserId(user.id);
    if (!vendorUser) {
      throw new Error("Forbidden: This user is not registered as a vendor administrator");
    }

    const jwtSecret = process.env.JWT_ACCESS_SECRET || "default-access-secret";
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        vendorId: vendorUser.vendorId,
        role: vendorUser.role,
        isVendor: true,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: vendorUser.role,
      },
      vendor: {
        id: vendorUser.vendor.id,
        name: vendorUser.vendor.name,
        email: vendorUser.vendor.email,
        status: vendorUser.vendor.status,
      },
    };
  }
}
