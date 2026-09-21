"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useBookings, useUpdateBookingStatus } from "@/features/bookings/use-bookings";
import { BookingCard } from "@/components/booking/booking-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { StatCard } from "@/components/common/stat-card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { CalendarClock, DollarSign, CheckCircle2, Flag } from "lucide-react";
import type { ProviderMe } from "@/features/provider/types";
import { formatCurrency } from "@/lib/utils";

export function useProviderProfile() {
  return useQuery({
    queryKey: ["provider-me"],
    queryFn: () => apiFetch<ProviderMe>("/api/v1/providers/me"),
  });
}

export function ProviderDashboard() {
  const profile = useProviderProfile();
  const bookings = useBookings();
  const qc = useQueryClient();

  const setAvailability = useMutation({
    mutationFn: (isAvailable: boolean) =>
      apiFetch<ProviderMe>("/api/v1/providers/me", {
        method: "PATCH",
        body: JSON.stringify({ isAvailable }),
      }),
    onSuccess: (data) => {
      qc.setQueryData(["provider-me"], data);
      toast.success(data.isAvailable ? "You are now visible to customers." : "You are hidden from search.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  if (profile.isLoading || bookings.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (profile.error || !profile.data) {
    return (
      <Alert variant="destructive">
        <TriangleAlert className="size-4" />
        <AlertTitle>Could not load your provider profile</AlertTitle>
        <AlertDescription>{(profile.error as Error | undefined)?.message}</AlertDescription>
      </Alert>
    );
  }

  const me = profile.data;
  const all = bookings.data ?? [];
  const pending = all.filter((b) => b.status === "PENDING");
  const activeJobs = all.filter((b) => ["CONFIRMED", "IN_PROGRESS"].includes(b.status));
  const completed = all.filter((b) => b.status === "COMPLETED");
  const earnings = completed.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending requests" value={pending.length} icon={CalendarClock} />
        <StatCard title="Active jobs" value={activeJobs.length} icon={CheckCircle2} />
        <StatCard title="Completed (platform)" value={me.completedJobs} icon={Flag} />
        <StatCard
          title="Earnings on SERVEX"
          value={formatCurrency(earnings)}
          icon={DollarSign}
          hint={`Avg rating ${me.ratingAvg > 0 ? me.ratingAvg : "—"}${me.ratingCount ? ` · ${me.ratingCount} reviews` : ""}`}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-card p-5">
        <div>
          <Label htmlFor="availability" className="text-base font-semibold">
            Accepting new jobs
          </Label>
          <p className="text-sm text-muted-foreground">
            When off, your profile is hidden from customer searches.
          </p>
        </div>
        <Switch
          id="availability"
          checked={me.isAvailable}
          disabled={setAvailability.isPending}
          onCheckedChange={(v) => setAvailability.mutate(v)}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Booking requests</h2>
        {bookings.error ? (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" />
            <AlertTitle>Could not load bookings</AlertTitle>
            <AlertDescription>{(bookings.error as Error).message}</AlertDescription>
          </Alert>
        ) : all.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No bookings yet. Keep your availability on to receive requests.
          </p>
        ) : (
          <div className="space-y-3">
            {[...pending, ...activeJobs, ...completed, ...all.filter((b) => b.status === "CANCELLED")].map((b) => (
              <BookingCard key={b.id} booking={b} viewerRole="PROVIDER" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
