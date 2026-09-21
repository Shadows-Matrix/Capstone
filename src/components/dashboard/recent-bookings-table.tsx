import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { BookingStatus } from "@/types";

export type RecentBookingRow = {
  id: string;
  status: BookingStatus;
  scheduledAt: string;
  totalAmount: number;
  serviceName: string;
  customerName: string;
  providerName: string;
};

export function RecentBookingsTable({ rows }: { rows: RecentBookingRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="max-w-[180px] truncate font-medium">{b.serviceName}</TableCell>
                  <TableCell>{b.customerName}</TableCell>
                  <TableCell>{b.providerName}</TableCell>
                  <TableCell>{formatDateTime(b.scheduledAt)}</TableCell>
                  <TableCell>{formatCurrency(b.totalAmount)}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={b.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}