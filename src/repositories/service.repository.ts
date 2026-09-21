import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const serviceRepository = {
  listInclude: {
    provider: {
      select: {
        id: true,
        city: true,
        area: true,
        isAvailable: true,
        user: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
    },
    category: { select: { id: true, name: true, slug: true } },
  } satisfies Prisma.ServiceOfferingInclude,

  findMany(where: Prisma.ServiceOfferingWhereInput, orderBy: Prisma.ServiceOfferingOrderByWithRelationInput, page: number, pageSize: number) {
    return prisma.$transaction([
      prisma.serviceOffering.findMany({
        where,
        include: this.listInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.serviceOffering.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.serviceOffering.findUnique({
      where: { id },
      include: this.listInclude,
    });
  },

  findOwnedById(id: string) {
    return prisma.serviceOffering.findUnique({
      where: { id },
      select: { id: true, providerId: true, provider: { select: { userId: true } } },
    });
  },

  create(data: Prisma.ServiceOfferingCreateInput) {
    return prisma.serviceOffering.create({ data, include: this.listInclude });
  },

  update(id: string, data: Prisma.ServiceOfferingUpdateInput) {
    return prisma.serviceOffering.update({ where: { id }, data, include: this.listInclude });
  },

  remove(id: string) {
    return prisma.serviceOffering.delete({ where: { id } });
  },

  listByProviderUserId(userId: string) {
    return prisma.serviceOffering.findMany({
      where: { provider: { userId } },
      include: this.listInclude,
      orderBy: { createdAt: "desc" },
    });
  },
};
