import { handleRoute, ok } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { engagementService } from "@/services/engagement.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleRoute(async () => {
    const user = await requireUser();
    const [items, unread] = await Promise.all([
      engagementService.listNotifications(user.id),
      engagementService.unreadCount(user.id),
    ]);
    return ok({ items, unread });
  });
}

export async function PATCH(req: Request) {
  return handleRoute(async () => {
    const user = await requireUser();
    const { ids } = z.object({ ids: z.array(z.string()).optional() }).parse(await req.json().catch(() => ({})));
    return ok(await engagementService.markNotificationsRead(user.id, ids));
  });
}