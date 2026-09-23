"use client";

import Link from "next/link";
import { HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCard } from "@/components/service/service-card";
import { EmptyState } from "@/components/common/empty-state";
import { useSavedServices } from "@/features/engagement/use-engagement";

export function SavedList() {
  const { data: services, isLoading } = useSavedServices();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <EmptyState icon={HeartOff} title="No saved services yet" text="Tap the heart on any service to save it here.">
        <Button asChild size="sm">
          <Link href="/services">Browse services</Link>
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <ServiceCard key={s.id} service={s} />
      ))}
    </div>
  );
}