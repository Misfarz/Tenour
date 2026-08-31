import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { RegisterVendorInput } from "../vendor.schemas";
import { UserRepository } from "../../users/user.repository";
import { prisma } from "../../../infrastructure/database/prisma/prisma.client";

export class RegisterVendorUseCase {
  static async execute(input: RegisterVendorInput) {
    const { companyName, contactName, password, phone, address, city, country } = input;
    const email = input.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("A user account with this email address already exists.");
    }

    // Hash password using argon2
    const hashedPassword = await argon2.hash(password);

    // Create User, Vendor, VendorContact, and VendorUser in a Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or Find Vendor
      let vendor = await tx.vendor.findFirst({
        where: {
          OR: [{ name: companyName.trim() }, { email }],
        },
      });

      if (!vendor) {
        vendor = await tx.vendor.create({
          data: {
            name: companyName.trim(),
            email,
            phone: phone || null,
            address: address || null,
            city: city || null,
            country: country || null,
            status: "ACTIVE",
            source: "PLATFORM_REGISTERED",
          },
        });
      } else {
        vendor = await tx.vendor.update({
          where: { id: vendor.id },
          data: {
            source: "PLATFORM_REGISTERED",
            status: "ACTIVE",
          },
        });
      }

      // 2. Create User
      const user = await tx.user.create({
        data: {
          name: contactName.trim(),
          email,
          password: hashedPassword,
        },
      });

      // 3. Create Vendor Contact
      await tx.vendorContact.create({
        data: {
          vendorId: vendor.id,
          name: contactName.trim(),
          email,
          phone: phone || null,
        },
      });

      // 4. Create VendorUser link
      const vendorUser = await tx.vendorUser.create({
        data: {
          vendorId: vendor.id,
          userId: user.id,
          role: "VENDOR_ADMIN",
        },
      });

      return { user, vendor, vendorUser };
    });

    const jwtSecret = process.env.JWT_ACCESS_SECRET || "default-access-secret";
    const accessToken = jwt.sign(
      {
        userId: result.user.id,
        email: result.user.email,
        vendorId: result.vendor.id,
        role: "VENDOR_ADMIN",
        isVendor: true,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return {
      accessToken,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: "VENDOR_ADMIN",
      },
      vendor: {
        id: result.vendor.id,
        name: result.vendor.name,
        email: result.vendor.email,
        status: result.vendor.status,
        source: result.vendor.source,
        hasVendorPortal: true,
      },
    };
  }
}
