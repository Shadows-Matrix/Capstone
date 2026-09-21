import { requireRole } from "@/lib/session";
import { adminService } from "@/services/admin.service";
import { StatCard } from "@/components/common/stat-card";
import { RecentBookingsTable } from "@/components/dashboard/recent-bookings-table";
import { StatusBar } from "@/components/dashboard/status-bar";
import { TopCategories } from "@/components/dashboard/top-categories";
import {
  Users,
  UserCog,
  UserCheck,
  Package,
  CalendarCheck2,
  DollarSign,
  Star,
} from "lucide-react";
import { BOOKING_STATUS_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole("ADMIN");
  const stats = await adminService.getDashboardStats();

  const statusTotals = Object.entries(stats.bookingsByStatus);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total users" value={stats.totals.users} icon={Users} />
        <StatCard title="Customers" value={stats.totals.customers} icon={UserCheck} />
        <StatCard title="Providers" value={stats.totals.providers} icon={UserCog} />
        <StatCard title="Active services" value={stats.totals.services} icon={Package} />
        <StatCard title="Total bookings" value={stats.totals.bookings} icon={CalendarCheck2} />
        <StatCard
          title="Completed revenue"
          value={formatCurrency(stats.revenueCompleted)}
          icon={DollarSign}
        />
        <StatCard
          title="Avg platform rating"
          value={stats.avgPlatformRating > 0 ? `${stats.avgPlatformRating} / 5` : "—"}
          icon={Star}
        />
        <StatCard
          title="Booking status count"
          value={`${statusTotals.reduce((a, [, n]) => a + n, 0)} total`}
          hint={statusTotals
            .filter(([, n]) => n > 0)
            .map(([s, n]) => `${BOOKING_STATUS_LABELS[s as keyof typeof BOOKING_STATUS_LABELS]}: ${n}`)
            .join(" · ")}
        />
      </div>

      <StatusBar statuses={stats.bookingsByStatus} />
      <TopCategories items={stats.topCategories} />
      <RecentBookingsTable rows={stats.recentBookings} />
    </div>
  );
}