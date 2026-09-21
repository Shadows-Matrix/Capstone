import { handleRoute, ok } from "@/lib/api";
import { providerService } from "@/services/provider.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  return handleRoute(async () => {
    const { id } = await ctx.params;
    const provider = await providerService.getDetail(id);
    return ok(provider);
  });
}
