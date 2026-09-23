import { handleRoute, ok } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { userRepository } from "@/repositories/user.repository";
import { z } from "zod";

export const dynamic = "force-dynamic";

const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(24).nullable().optional(),
  city: z.string().max(80).nullable().optional(),
});

export async function GET() {
  return handleRoute(async () => {
    const user = await requireUser();
    return ok(await userRepository.findById(user.id));
  });
}

export async function PATCH(req: Request) {
  return handleRoute(async () => {
    const user = await requireUser();
    const input = profileUpdateSchema.parse(await req.json());
    return ok(await userRepository.updateProfile(user.id, input));
  });
}