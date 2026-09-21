import { handleRoute, ok } from "@/lib/api";
import { serviceService } from "@/services/service.service";
import { serviceFilterSchema } from "@/lib/validation";
import { requireRole } from "@/lib/session";

export async function GET(req: Request) {
  return handleRoute(async () => {
    const url = new URL(req.url);
    const filter = serviceFilterSchema.parse(Object.fromEntries(url.searchParams));
    const result = await serviceService.list(filter);
    return ok(result);
  });
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const user = await requireRole("PROVIDER");
    const body = await req.json();
    const service = await serviceService.create(user.id, body);
    return ok(service, 201);
  });
}
