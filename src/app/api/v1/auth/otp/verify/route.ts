import { handleRoute, ok } from "@/lib/api";
import { otpVerifySchema } from "@/lib/validation";
import { otpService } from "@/services/otp.service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const body = await req.json();
    const input = otpVerifySchema.parse(body);
    return ok(await otpService.verify(input));
  });
}