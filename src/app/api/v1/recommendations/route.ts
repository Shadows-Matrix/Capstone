import { handleRoute, ok } from "@/lib/api";
import { recommendationService } from "@/services/recommendation.service";
import { recommendationQuerySchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  return handleRoute(async () => {
    const url = new URL(req.url);
    const query = recommendationQuerySchema.parse(Object.fromEntries(url.searchParams));

    // Resolve a serviceId into its category when only the service is given
    let categoryId = query.categoryId;
    if (!categoryId && query.serviceId) {
      const offering = await prisma.serviceOffering.findUnique({
        where: { id: query.serviceId },
        select: { categoryId: true },
      });
      categoryId = offering?.categoryId;
    }

    const recommendations = await recommendationService.recommend({
      serviceId: query.serviceId,
      categoryId,
      city: query.city,
      limit: query.limit,
    });
    return ok(recommendations);
  });
}
