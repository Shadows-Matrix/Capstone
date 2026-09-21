import { ApiError, handleRoute, ok } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { reviewService } from "@/services/review.service";
import { reviewCreateSchema } from "@/lib/validation";

export async function GET(req: Request) {
  return handleRoute(async () => {
    const url = new URL(req.url);
    const providerId = url.searchParams.get("providerId");
    if (!providerId) {
      throw new ApiError(422, "providerId query parameter is required", "VALIDATION_ERROR");
    }
    const reviews = await reviewService.listForProvider(providerId);
    return ok(reviews);
  });
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const user = await requireUser();
    if (user.role !== "CUSTOMER") {
      throw new ApiError(403, "Only customers can write reviews", "FORBIDDEN");
    }
    const body = await req.json();
    const input = reviewCreateSchema.parse(body);
    const review = await reviewService.create(user.id, input);
    return ok(review, 201);
  });
}
