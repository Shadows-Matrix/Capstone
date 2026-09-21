import { handleRoute, ok } from "@/lib/api";
import { requireRole } from "@/lib/session";
import { providerService } from "@/services/provider.service";

export async function GET() {
  return handleRoute(async () => {
    const user = await requireRole("PROVIDER");
    const profile = await providerService.getMe(user.id);
    return ok(profile);
  });
}

export async function PATCH(req: Request) {
  return handleRoute(async () => {
    const user = await requireRole("PROVIDER");
    const body = await req.json();
    const profile = await providerService.updateMe(user.id, body);
    return ok(profile);
  });
}
