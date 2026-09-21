import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Reviews are selected as plain rating values; averages are computed in the
 * service layer (Prisma relation aggregates only support _count in includes).
 */
export const providerRepository = {
  include: {
    user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    reviews: { select: { rating: true } },
    _count: { select: { offerings: true } },
  } satisfies Prisma.ProviderProfileInclude,

  findMany(where: Prisma.ProviderProfileWhereInput, page: number, pageSize: number) {
    return prisma.$transaction([
      prisma.providerProfile.findMany({
        where,
        include: this.include,
        orderBy: { completedJobs: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.providerProfile.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        reviews: { select: { rating: true } },
        _count: { select: { offerings: true } },
        offerings: {
          where: { isActive: true },
          include: { category: true },
          orderBy: { price: "asc" },
        },
      },
    });
  },

  findByUserId(userId: string) {
    return prisma.providerProfile.findUnique({
      where: { userId },
      include: this.include,
    });
  },

  updateByUserId(userId: string, data: Prisma.ProviderProfileUpdateInput) {
    return prisma.providerProfile.update({ where: { userId }, data });
  },

  incrementCompletedJobs(providerId: string) {
    return prisma.providerProfile.update({
      where: { id: providerId },
      data: { completedJobs: { increment: 1 } },
    });
  },

  listCities() {
    return prisma.providerProfile.findMany({
      distinct: ["city"],
      select: { city: true },
      orderBy: { city: "asc" },
    });
  },
};

export function averageRating(ratings: { rating: number }[]): { avg: number; count: number } {
  if (ratings.length === 0) return { avg: 0, count: 0 };
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return { avg: Math.round((sum / ratings.length) * 10) / 10, count: ratings.length };
}
