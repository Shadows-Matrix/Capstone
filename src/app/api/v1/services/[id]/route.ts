import { handleRoute, ok } from "@/lib/api";
import { serviceService } from "@/services/service.service";
import { requireRole } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  return handleRoute(async () => {
    const { id } = await ctx.params;
    const service = await serviceService.getById(id);
    return ok(service);
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  return handleRoute(async () => {
    const { id } = await ctx.params;
    const user = await requireRole("PROVIDER", "ADMIN");
    const body = await req.json();
    const service = await serviceService.update(id, user.id, user.role, body);
    return ok(service);
  });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  return handleRoute(async () => {
    const { id } = await ctx.params;
    const user = await requireRole("PROVIDER", "ADMIN");
    await serviceService.remove(id, user.id, user.role);
    return ok({ deleted: true });
  });
}
