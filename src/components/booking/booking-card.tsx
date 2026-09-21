"use client";

import { toast } from "sonner";
import { Check, X, Play, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { ReviewDialog } from "@/components/booking/review-dialog";
import { useUpdateBookingStatus } from "@/features/bookings/use-bookings";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { BookingDto, Role } from "@/types";

export function BookingCard({
  booking,
  viewerRole,
}: {
  booking: BookingDto;
  viewerRole: Role;
}) {
  const updateStatus = useUpdateBookingStatus();

  async function transition(status: "CONFIRMED" | "CANCELLED" | "IN_PROGRESS" | "COMPLETED") {
    try {
      await updateStatus.mutateAsync({ id: booking.id, status });
      toast.success(`Booking ${status.toLowerCase().replace("_", " ")}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  const isCustomer = viewerRole === "CUSTOMER";
  const canCancel = ["PENDING", "CONFIRMED"].includes(booking.status);
  const pending = updateStatus.isPending;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{booking.service.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isCustomer ? `Provider: ${booking.provider.name}` : `Customer: ${booking.customer.name}`}
            {" · "}
            {booking.provider.city}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <Separator className="my-4" />

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Scheduled</dt>
          <dd className="font-medium">{formatDateTime(booking.scheduledAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Total</dt>
          <dd className="font-medium">{formatCurrency(booking.totalAmount)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">Address</dt>
          <dd className="truncate font-medium" title={booking.address}>{booking.address}</dd>
        </div>
      </dl>

      {booking.notes && (
        <p className="mt-3 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{booking.notes}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Provider actions */}
        {viewerRole === "PROVIDER" && booking.status === "PENDING" && (
          <>
            <Button size="sm" disabled={pending} onClick={() => transition("CONFIRMED")}>
              <Check className="mr-1 size-4" /> Accept
            </Button>
            <Button size="sm" variant="destructive" disabled={pending} onClick={() => transition("CANCELLED")}>
              <X className="mr-1 size-4" /> Decline
            </Button>
          </>
        )}
        {viewerRole === "PROVIDER" && booking.status === "CONFIRMED" && (
          <>
            <Button size="sm" disabled={pending} onClick={() => transition("IN_PROGRESS")}>
              <Play className="mr-1 size-4" /> Start job
            </Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => transition("CANCELLED")}>
              <X className="mr-1 size-4" /> Cancel
            </Button>
          </>
        )}
        {viewerRole === "PROVIDER" && booking.status === "IN_PROGRESS" && (
          <>
            <Button size="sm" disabled={pending} onClick={() => transition("COMPLETED")}>
              <Flag className="mr-1 size-4" /> Mark complete
            </Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => transition("CANCELLED")}>
              <X className="mr-1 size-4" /> Cancel
            </Button>
          </>
        )}

        {/* Customer actions */}
        {isCustomer && canCancel && (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => transition("CANCELLED")}>
            <X className="mr-1 size-4" /> Cancel booking
          </Button>
        )}
        {isCustomer && booking.status === "COMPLETED" && !booking.hasReview && (
          <ReviewDialog bookingId={booking.id} />
        )}
        {isCustomer && booking.status === "COMPLETED" && booking.hasReview && (
          <span className="text-sm text-muted-foreground">Reviewed ✓</span>
        )}
      </div>
    </div>
  );
}
