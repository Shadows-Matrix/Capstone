import { NextResponse } from "next/server";
import { handleRoute, ok } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { bookingUpdateSchema } from "@/lib/validation";
import { bookingService } from "@/services/booking.service";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { id } = await params;
    const user = await requireUser();
    const body = await req.json();
    const { status } = bookingUpdateSchema.parse(body);
    const booking = await bookingService.updateStatus(id, user, status);
    return ok(booking);
  });
}

export function GET() {
  return NextResponse.json(
    { error: { code: "METHOD_NOT_ALLOWED", message: "Use PATCH to update a booking." } },
    { status: 405 }
  );
}