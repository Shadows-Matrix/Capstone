import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_LABELS } from "@/types";
import type { BookingStatus } from "@/types";
import { cn } from "@/lib/utils";

const STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  CONFIRMED: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  IN_PROGRESS: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  COMPLETED: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  CANCELLED: "bg-red-100 text-red-700 hover:bg-red-100",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge className={cn("font-medium", STYLES[status])} variant="secondary">
      {BOOKING_STATUS_LABELS[status]}
    </Badge>
  );
}
