import { ApiError, handleRoute, ok } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { bookingService } from "@/services/booking.service";
import { bookingCreateSchema } from "@/lib/validation";

export async function GET() {
  return handleRoute(async () => {
    const user = await requireUser();
    const bookings = await bookingService.listForUser(user.role, user.id);
    return ok(bookings);
  });
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const user = await requireUser();
    if (user.role !== "CUSTOMER") {
      throw new ApiError(403, "Only customers can create bookings", "FORBIDDEN");
    }
    const body = await req.json();
    const input = bookingCreateSchema.parse(body);
    const booking = await bookingService.create(user.id, input);
    return ok(booking, 201);
  });
}
