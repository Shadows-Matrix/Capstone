import { ApiError } from "@/lib/api";
import { averageRating, providerRepository } from "@/repositories/provider.repository";
import type { ProviderDetail, ProviderListItem } from "@/types";
import type { z } from "zod";
import type { providerProfileUpdateSchema } from "@/lib/validation";

export type ProviderProfileUpdateInput = z.infer<typeof providerProfileUpdateSchema>;

type ProfileRow = {
  id: string;
  bio: string | null;
  city: string;
  area: string | null;
  basePrice: number;
  isAvailable: boolean;
  completedJobs: number;
  yearsExperience: number;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
  reviews: { rating: number }[];
};

function ratingOf(row: ProfileRow) {
  const { avg, count } = averageRating(row.reviews);
  return { ratingAvg: avg, ratingCount: count };
}

function toListItem(row: ProfileRow, offeringsCount: number): ProviderListItem {
  return {
    id: row.id,
    userId: row.user.id,
    name: row.user.name,
    avatarUrl: row.user.avatarUrl,
    bio: row.bio,
    city: row.city,
    area: row.area,
    basePrice: row.basePrice,
    isAvailable: row.isAvailable,
    completedJobs: row.completedJobs,
    yearsExperience: row.yearsExperience,
    ...ratingOf(row),
    offeringsCount,
  };
}

export const providerService = {
  async list(filter: { q?: string; city?: string; page: number; pageSize: number }) {
    const where = {
      ...(filter.city ? { city: filter.city } : {}),
      ...(filter.q
        ? {
            OR: [
              { user: { name: { contains: filter.q } } },
              { bio: { contains: filter.q } },
            ],
          }
        : {}),
    };
    const [rows, total] = await providerRepository.findMany(where, filter.page, filter.pageSize);
    return {
      items: rows.map((r) => toListItem(r, r._count.offerings)),
      total,
      page: filter.page,
      pageSize: filter.pageSize,
    };
  },

  async getDetail(id: string): Promise<ProviderDetail> {
    const row = await providerRepository.findById(id);
    if (!row) throw new ApiError(404, "Provider not found", "NOT_FOUND");
    return {
      ...toListItem(row, row.offerings.length),
      offerings: row.offerings.map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        price: o.price,
        durationMins: o.durationMins,
        imageUrl: o.imageUrl,
        categoryName: o.category.name,
        categorySlug: o.category.slug,
      })),
    };
  },

  async getMe(userId: string) {
    const profile = await providerRepository.findByUserId(userId);
    if (!profile) throw new ApiError(404, "Provider profile not found", "NOT_FOUND");
    return {
      id: profile.id,
      name: profile.user.name,
      email: profile.user.email,
      avatarUrl: profile.user.avatarUrl,
      bio: profile.bio,
      city: profile.city,
      area: profile.area,
      basePrice: profile.basePrice,
      isAvailable: profile.isAvailable,
      completedJobs: profile.completedJobs,
      yearsExperience: profile.yearsExperience,
      ...ratingOf(profile),
    };
  },

  async updateMe(userId: string, input: ProviderProfileUpdateInput) {
    const existing = await providerRepository.findByUserId(userId);
    if (!existing) throw new ApiError(404, "Provider profile not found", "NOT_FOUND");
    await providerRepository.updateByUserId(userId, input);
    return this.getMe(userId);
  },

  listCities() {
    return providerRepository.listCities().then((rows) => rows.map((r) => r.city));
  },
};
