import { handleRoute, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return handleRoute(async () => {
    const [categories, cities] = await Promise.all([
      prisma.serviceCategory.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      prisma.providerProfile.findMany({
        distinct: ["city"],
        select: { city: true },
        orderBy: { city: "asc" },
      }),
    ]);
    return ok({ categories, cities: cities.map((c) => c.city) });
  });
}
