import { prisma } from "@/lib/prisma";
import type { RecommendationFactors, RecommendationInput, ScoredProvider } from "@/types";

/**
 * Weights for the rule-based scoring model.
 * A future ML model can implement `RecommendationStrategy` and be swapped in
 * without touching any calling code.
 */
export const RECOMMENDATION_WEIGHTS = {
  rating: 0.3,
  availability: 0.25,
  location: 0.2,
  price: 0.15,
  completion: 0.1,
} as const;

/** Jobs completed at which the completion score saturates (log scale). */
const COMPLETION_SATURATION = 400;

export interface RecommendationStrategy {
  rank(input: RecommendationInput): Promise<ScoredProvider[]>;
}

export function computeCompletionScore(completedJobs: number): number {
  return Math.min(1, Math.log1p(Math.max(0, completedJobs)) / Math.log1p(COMPLETION_SATURATION));
}

export function buildExplanation(factors: RecommendationFactors, ctx: {
  ratingAvg: number;
  ratingCount: number;
  isAvailable: boolean;
  city: string;
  completedJobs: number;
}): string {
  const parts: string[] = [];

  if (ctx.ratingCount > 0) {
    parts.push(`a ${ctx.ratingAvg.toFixed(1)}★ average rating`);
  }
  if (factors.availabilityScore >= 1) {
    parts.push("is currently available");
  }
  if (factors.locationScore >= 1) {
    parts.push(`is based in ${ctx.city}, close to your location`);
  }
  if (factors.priceScore >= 0.6) {
    parts.push("offers competitive pricing");
  }
  if (factors.completionScore >= 0.4) {
    parts.push(`has successfully completed ${ctx.completedJobs} jobs`);
  }

  if (parts.length === 0) {
    return "Recommended as a well-matched provider for your request.";
  }

  const head = parts.slice(0, -1).join(", ");
  const tail = parts[parts.length - 1];
  return `Recommended because this provider has ${head}${head ? " and " : ""}${tail}.`;
}

type CandidateRow = Awaited<ReturnType<typeof fetchCandidates>>[number];

async function fetchCandidates(input: RecommendationInput) {
  return prisma.serviceOffering.findMany({
    where: {
      isActive: true,
      ...(input.serviceId ? { id: input.serviceId } : {}),
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    },
    include: {
      category: { select: { name: true } },
      provider: {
        include: {
          user: { select: { name: true, avatarUrl: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
  });
}

/**
 * Rule-based scoring:
 *   score = rating*0.30 + availability*0.25 + location*0.20 + price*0.15 + completion*0.10
 */
export class RuleBasedStrategy implements RecommendationStrategy {
  async rank(input: RecommendationInput): Promise<ScoredProvider[]> {
    const candidates = await fetchCandidates(input);
    if (candidates.length === 0) return [];

    // One entry per provider — keep their cheapest matching offering.
    const byProvider = new Map<string, CandidateRow>();
    for (const c of candidates) {
      const existing = byProvider.get(c.providerId);
      if (!existing || c.price < existing.price) byProvider.set(c.providerId, c);
    }

    const rows = [...byProvider.values()];
    const prices = rows.map((r) => r.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const scored = rows.map((row) => {
      const ratings = row.provider.reviews;
      const ratingAvg = ratings.length === 0 ? 0 : ratings.reduce((a, r) => a + r.rating, 0) / ratings.length;
      const ratingCount = ratings.length;

      const factors: RecommendationFactors = {
        ratingScore: Math.min(1, ratingAvg / 5),
        availabilityScore: row.provider.isAvailable ? 1 : 0,
        locationScore: !input.city ? 0.5 : row.provider.city.toLowerCase() === input.city.toLowerCase() ? 1 : 0.25,
        priceScore: maxPrice === minPrice ? 0.5 : (maxPrice - row.price) / (maxPrice - minPrice),
        completionScore: computeCompletionScore(row.provider.completedJobs),
      };

      const score =
        factors.ratingScore * RECOMMENDATION_WEIGHTS.rating +
        factors.availabilityScore * RECOMMENDATION_WEIGHTS.availability +
        factors.locationScore * RECOMMENDATION_WEIGHTS.location +
        factors.priceScore * RECOMMENDATION_WEIGHTS.price +
        factors.completionScore * RECOMMENDATION_WEIGHTS.completion;

      return { row, factors, score, ratingAvg, ratingCount };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, input.limit).map(({ row, factors, score, ratingAvg, ratingCount }, i) => ({
      rank: i + 1,
      score: Math.round(score * 1000) / 10,
      explanation: buildExplanation(factors, {
        ratingAvg,
        ratingCount,
        isAvailable: row.provider.isAvailable,
        city: row.provider.city,
        completedJobs: row.provider.completedJobs,
      }),
      providerId: row.provider.id,
      providerName: row.provider.user.name,
      avatarUrl: row.provider.user.avatarUrl,
      city: row.provider.city,
      area: row.provider.area,
      isAvailable: row.provider.isAvailable,
      completedJobs: row.provider.completedJobs,
      ratingAvg: Math.round(ratingAvg * 10) / 10,
      ratingCount,
      offering: {
        id: row.id,
        title: row.title,
        price: row.price,
        durationMins: row.durationMins,
        categoryName: row.category.name,
      },
    }));
  }
}

export class RecommendationService {
  constructor(private strategy: RecommendationStrategy) {}

  /**
   * Swap point for a future AI/ML model:
   *   new RecommendationService(new MlStrategy(...))
   */
  recommend(input: RecommendationInput) {
    return this.strategy.rank(input);
  }
}

export const recommendationService = new RecommendationService(new RuleBasedStrategy());
