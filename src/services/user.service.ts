import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { userRepository } from "@/repositories/user.repository";
import type { z } from "zod";
import type { registerSchema } from "@/lib/validation";

export type RegisterInput = z.infer<typeof registerSchema>;

export const userService = {
  async register(input: RegisterInput) {
    const email = input.email.toLowerCase();

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ApiError(409, "An account with this email already exists", "EMAIL_TAKEN");
    }

    if (input.role === "PROVIDER" && !input.city) {
      throw new ApiError(422, "City is required for provider accounts", "VALIDATION_ERROR");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        role: input.role,
        phone: input.phone,
        city: input.city,
        ...(input.role === "PROVIDER"
          ? {
              providerProfile: {
                create: {
                  city: input.city!,
                  basePrice: 0,
                },
              },
            }
          : {}),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return user;
  },

  getProfile(userId: string) {
    return userRepository.findById(userId);
  },
};
