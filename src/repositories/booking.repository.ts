import { prisma } from "@/lib/prisma";
import type { Prisma, BookingStatus } from "@prisma/client";

export const bookingRepository = {
  detailInclude: {
    service: { select: { id: true, title: true, durationMins: true } },
    customer: { select: { id: true, name: true } },
    provider: {
      select: {
        id: true,
        city: true,
        user: { select: { name: true, phone: true } },
      },
    },
    review: { select: { id: true } },
  } satisfies Prisma.BookingInclude,

  create(data: Prisma.BookingCreateInput) {
    return prisma.booking.create({ data, include: this.detailInclude });
  },

  findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        ...this.detailInclude,
        customer: { select: { id: true, name: true, role: true } },
        provider: { select: { id: true, userId: true, city: true, user: { select: { name: true, phone: true } } } },
      },
    });
  },

  listByCustomer(customerId: string) {
    return prisma.booking.findMany({
      where: { customerId },
      include: this.detailInclude,
      orderBy: { scheduledAt: "desc" },
    });
  },

  listByProvider(providerId: string) {
    return prisma.booking.findMany({
      where: { providerId },
      include: this.detailInclude,
      orderBy: { scheduledAt: "desc" },
    });
  },

  updateStatus(id: string, status: BookingStatus) {
    return prisma.booking.update({ where: { id }, data: { status }, include: this.detailInclude });
  },

  countAll() {
    return prisma.booking.count();
  },

  groupByStatus() {
    return prisma.booking.groupBy({ by: ["status"], _count: { _all: true } });
  },

  revenueCompleted() {
    return prisma.booking.aggregate({
      _sum: { totalAmount: true },
      where: { status: "COMPLETED" },
    });
  },

  recent(limit = 10) {
    return prisma.booking.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: this.detailInclude,
    });
  },

  topCategories(limit = 5) {
    return prisma.booking.groupBy({
      by: ["serviceId"],
      _count: { _all: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: limit * 4,
    });
  },
};
