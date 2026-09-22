import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { providerRepository } from "@/repositories/provider.repository";
import { serviceRepository } from "@/repositories/service.repository";
import type { ServiceListItem, ServiceListResult } from "@/types";
import type { z } from "zod";
import type { serviceCreateSchema, serviceUpdateSchema, serviceFilterSchema } from "@/lib/validation";

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type ServiceFilter = z.infer<typeof serviceFilterSchema>;

type OfferingRow = Awaited<ReturnType<typeof serviceRepository.findById>>;

function toServiceListItem(offering: NonNullable<OfferingRow>): ServiceListItem {
  const ratings = offering.provider.reviews;
  const ratingAvg = ratings.length === 0 ? 0 : ratings.reduce((a, r) => a + r.rating, 0) / ratings.length;
  return {
    id: offering.id,
    title: offering.title,
    description: offering.description,
    price: offering.price,
    durationMins: offering.durationMins,
    imageUrl: offering.imageUrl,
    isActive: offering.isActive,
    createdAt: offering.createdAt.toISOString(),
    category: offering.category,
    provider: {
      id: offering.provider.id,
      name: offering.provider.user.name,
      city: offering.provider.city,
      area: offering.provider.area,
      isAvailable: offering.provider.isAvailable,
      ratingAvg: Math.round(ratingAvg * 10) / 10,
      ratingCount: ratings.length,
    },
  };
}

async function resolveCategoryFilter(category?: string): Promise<{ categoryId?: string }> {
  if (!category) return {};
  const found = await prisma.serviceCategory.findFirst({
    where: { OR: [{ slug: category }, { name: { equals: category, mode: "insensitive" } }] },
    select: { id: true },
  });
  // Unknown category matches nothing rather than everything
  return found ? { categoryId: found.id } : { categoryId: "__none__" };
}

function buildWhere(filter: ServiceFilter) {
  return {
    isActive: true,
    ...filter.q
      ? {
          OR: [
            { title: { contains: filter.q, mode: "insensitive" as const } },
            { description: { contains: filter.q, mode: "insensitive" as const } },
            { provider: { user: { name: { contains: filter.q, mode: "insensitive" as const } } } },
          ],
        }
      : {},
  };
}

export const serviceService = {
  async list(filter: ServiceFilter): Promise<ServiceListResult> {
    const categoryClause = await resolveCategoryFilter(filter.category);
    const cityClause = filter.city ? { provider: { city: { equals: filter.city, mode: "insensitive" as const } } } : {};
    const base = buildWhere(filter);
    const where = { ...base, ...categoryClause, ...cityClause };

    if (filter.sort === "rating") {
      // Aggregate ratings cannot be ordered at the DB level — sort in memory.
      const rows = await prisma.serviceOffering.findMany({
        where,
        include: serviceRepository.listInclude,
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      const items = rows
        .map(toServiceListItem)
        .sort((a, b) => b.provider.ratingAvg - a.provider.ratingAvg || b.provider.ratingCount - a.provider.ratingCount);
      const start = (filter.page - 1) * filter.pageSize;
      return { items: items.slice(start, start + filter.pageSize), total: items.length, page: filter.page, pageSize: filter.pageSize };
    }

    const orderBy =
      filter.sort === "price-asc"
        ? { price: "asc" as const }
        : filter.sort === "price-desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };

    const [rows, total] = await serviceRepository.findMany(where, orderBy, filter.page, filter.pageSize);
    return { items: rows.map(toServiceListItem), total, page: filter.page, pageSize: filter.pageSize };
  },

  async getById(id: string): Promise<ServiceListItem> {
    const offering = await serviceRepository.findById(id);
    if (!offering || !offering.isActive) throw new ApiError(404, "Service not found", "NOT_FOUND");
    return toServiceListItem(offering);
  },

  async listMine(userId: string): Promise<ServiceListItem[]> {
    const rows = await serviceRepository.listByProviderUserId(userId);
    return rows.map(toServiceListItem);
  },

  async create(userId: string, input: ServiceCreateInput): Promise<ServiceListItem> {
    const profile = await providerRepository.findByUserId(userId);
    if (!profile) throw new ApiError(403, "Only providers can create services", "FORBIDDEN");

    const category = await prisma.serviceCategory.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new ApiError(404, "Category not found", "NOT_FOUND");

    const created = await serviceRepository.create({
      title: input.title,
      description: input.description,
      price: input.price,
      durationMins: input.durationMins,
      imageUrl: input.imageUrl ?? null,
      isActive: input.isActive,
      provider: { connect: { id: profile.id } },
      category: { connect: { id: category.id } },
    });
    return toServiceListItem(created);
  },

  async update(id: string, userId: string, role: string, input: ServiceUpdateInput): Promise<ServiceListItem> {
    const owned = await serviceRepository.findOwnedById(id);
    if (!owned) throw new ApiError(404, "Service not found", "NOT_FOUND");
    if (role !== "ADMIN" && owned.provider.userId !== userId) {
      throw new ApiError(403, "You can only edit your own services", "FORBIDDEN");
    }

    const updated = await serviceRepository.update(id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.durationMins !== undefined && { durationMins: input.durationMins }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.categoryId !== undefined && { category: { connect: { id: input.categoryId } } }),
    });
    return toServiceListItem(updated);
  },

  async remove(id: string, userId: string, role: string): Promise<void> {
    const owned = await serviceRepository.findOwnedById(id);
    if (!owned) throw new ApiError(404, "Service not found", "NOT_FOUND");
    if (role !== "ADMIN" && owned.provider.userId !== userId) {
      throw new ApiError(403, "You can only delete your own services", "FORBIDDEN");
    }
    try {
      await serviceRepository.remove(id);
    } catch {
      throw new ApiError(
        409,
        "This service has existing bookings and cannot be deleted. Deactivate it instead.",
        "SERVICE_IN_USE"
      );
    }
  },

  async listCities(): Promise<string[]> {
    const rows = await prisma.providerProfile.findMany({
      distinct: ["city"],
      select: { city: true },
      orderBy: { city: "asc" },
    });
    return rows.map((r) => r.city);
  },
};
