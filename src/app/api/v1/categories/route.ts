import { handleRoute, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return handleRoute(async () => {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, description: true, icon: true },
    });
    return ok(categories);
  });
}
