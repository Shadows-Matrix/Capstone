import { handleRoute, ok } from "@/lib/api";
import { providerService } from "@/services/provider.service";
import { paginationSchema } from "@/lib/validation";

export async function GET(req: Request) {
  return handleRoute(async () => {
    const url = new URL(req.url);
    const { page, pageSize } = paginationSchema.parse(Object.fromEntries(url.searchParams));
    const q = url.searchParams.get("q") ?? undefined;
    const city = url.searchParams.get("city") ?? undefined;
    const result = await providerService.list({ q, city, page, pageSize });
    return ok(result);
  });
}
