"use client";

import { useBookings } from "@/features/bookings/use-bookings";
import { BookingCard } from "@/components/booking/booking-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarX2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";

const ACTIVE = ["PENDING", "CONFIRMED", "IN_PROGRESS"] as const;

export function CustomerDashboard({ role }: { role: Role }) {
  const { data: bookings, isLoading, error } = useBookings();

  if (error) {
    return (
      <Alert variant="destructive">
        <TriangleAlert className="size-4" />
        <AlertTitle>Could not load bookings</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const all = bookings ?? [];
  const active = all.filter((b) => (ACTIVE as readonly string[]).includes(b.status));
  const history = all.filter((b) => !(ACTIVE as readonly string[]).includes(b.status));

  return (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">
          Upcoming ({active.length})
        </TabsTrigger>
        <TabsTrigger value="history">History ({history.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="mt-4 space-y-3">
        {active.length === 0 ? (
          <EmptyBookings />
        ) : (
          active.map((b) => <BookingCard key={b.id} booking={b} viewerRole={role} />)
        )}
      </TabsContent>
      <TabsContent value="history" className="mt-4 space-y-3">
        {history.length === 0 ? (
          <EmptyBookings />
        ) : (
          history.map((b) => <BookingCard key={b.id} booking={b} viewerRole={role} />)
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyBookings() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <CalendarX2 className="size-10 text-muted-foreground/50" />
      <p className="font-medium">No bookings here yet</p>
      <p className="text-sm text-muted-foreground">Browse services and book a trusted professional.</p>
      <Button asChild>
        <Link href="/services">Browse services</Link>
      </Button>
    </div>
  );
}
