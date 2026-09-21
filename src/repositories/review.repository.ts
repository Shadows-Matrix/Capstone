import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const reviewRepository = {
  findByBookingId(bookingId: string) {
    return prisma.review.findUnique({ where: { bookingId } });
  },

  create(data: Prisma.ReviewCreateInput) {
    return prisma.review.create({ data });
  },

  listByProvider(providerId: string, take = 20) {
    return prisma.review.findMany({
      where: { providerId },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take,
    });
  },

  ratingForProvider(providerId: string) {
    return prisma.review.aggregate({
      _avg: { rating: true },
      _count: { _all: true },
      where: { providerId },
    });
  },

  platformAverage() {
    return prisma.review.aggregate({ _avg: { rating: true }, _count: { _all: true } });
  },
};
