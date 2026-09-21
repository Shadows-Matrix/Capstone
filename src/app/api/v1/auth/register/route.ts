import { handleRoute, ok } from "@/lib/api";
import { userService } from "@/services/user.service";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const body = await req.json();
    const input = registerSchema.parse(body);
    const user = await userService.register(input);
    return ok({ user }, 201);
  });
}
