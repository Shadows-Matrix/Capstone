import { handleRoute, ok } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { engagementService } from "@/services/engagement.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleRoute(async () => {
    const user = await requireUser();
    return ok(await engagementService.listSaved(user.id));
  });
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const user = await requireUser();
    const { serviceId } = z.object({ serviceId: z.string().min(1) }).parse(await req.json());
    return ok(await engagementService.saveService(user.id, serviceId), 201);
  });
}

export async function DELETE(req: Request) {
  return handleRoute(async () => {
    const user = await requireUser();
    const serviceId = new URL(req.url).searchParams.get("serviceId") ?? "";
    if (!serviceId) return ok({ saved: false });
    return ok(await engagementService.unsaveService(user.id, serviceId));
  });
}