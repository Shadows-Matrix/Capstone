import { prisma } from "@/lib/prisma";
import type { Prisma, Role } from "@prisma/client";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, phone: true, city: true, avatarUrl: true, createdAt: true },
    });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: { id: true, name: true, email: true, role: true },
    });
  },

  countByRole(role: Role) {
    return prisma.user.count({ where: { role } });
  },

  countAll() {
    return prisma.user.count();
  },

  updateProfile(id: string, data: { name?: string; phone?: string | null; city?: string | null }) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, phone: true, city: true, avatarUrl: true },
    });
  },
};
