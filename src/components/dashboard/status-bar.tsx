import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { BookingStatus } from "@/types";

export function StatusBar({ statuses }: { statuses: Record<BookingStatus, number> }) {
  const total = Object.values(statuses).reduce((a, n) => a + n, 0);
  const order: BookingStatus[] = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Bookings by status</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {order
              .filter((s) => statuses[s] > 0)
              .map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="flex w-32 shrink-0 items-center gap-1.5">
                    <BookingStatusBadge status={s} />
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(statuses[s] / total) * 100}%` }}
                    />
                  </div>
                  <Badge variant="secondary" className="w-10 justify-center">
                    {statuses[s]}
                  </Badge>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}