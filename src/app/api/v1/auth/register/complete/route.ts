import { handleRoute, ok } from "@/lib/api";
import { signupCompleteSchema } from "@/lib/validation";
import { otpService } from "@/services/otp.service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const body = await req.json();
    const input = signupCompleteSchema.parse(body);
    return ok(await otpService.completeSignup(input), 201);
  });
}