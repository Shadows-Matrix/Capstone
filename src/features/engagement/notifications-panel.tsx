"use client";

import { useEffect } from "react";
import { BellOff, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { useNotifications, useMarkNotificationsRead } from "@/features/engagement/use-engagement";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function NotificationsPanel() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const items = data?.items ?? [];
  const unreadIds = items.filter((n) => !n.read).map((n) => n.id);

  useEffect(() => {
    if (unreadIds.length > 0) {
      const t = setTimeout(() => markRead.mutate(undefined), 2000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.unread]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState icon={BellOff} title="No notifications" text="Booking updates and messages will appear here." />;
  }

  return (
    <div className="space-y-3">
      {unreadIds.length > 0 && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" disabled={markRead.isPending} onClick={() => markRead.mutate(undefined)}>
            <CheckCheck className="mr-1 size-4" /> Mark all read
          </Button>
        </div>
      )}
      {items.map((n) => (
        <div
          key={n.id}
          className={cn("rounded-xl border bg-card p-4", !n.read && "border-primary/40 bg-primary/[0.03]")}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium leading-snug">{n.title}</p>
            <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
        </div>
      ))}
    </div>
  );
}