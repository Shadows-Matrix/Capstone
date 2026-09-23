import { handleRoute, ok } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { engagementService } from "@/services/engagement.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { id } = await params;
    const user = await requireUser();
    return ok(await engagementService.listMessages(id, user.id, user.role));
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { id } = await params;
    const user = await requireUser();
    const { text } = z.object({ text: z.string().min(1).max(1000) }).parse(await req.json());
    return ok(await engagementService.sendMessage(id, user.id, user.role, text), 201);
  });
}