import { handleRoute, ok } from "@/lib/api";
import { requireRole } from "@/lib/session";
import { serviceService } from "@/services/service.service";

export async function GET() {
  return handleRoute(async () => {
    const user = await requireRole("PROVIDER");
    const services = await serviceService.listMine(user.id);
    return ok(services);
  });
}