import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { NotificationsPanel } from "@/features/engagement/notifications-panel";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/notifications");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bell className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Booking updates and new messages.</p>
        </div>
      </div>
      <NotificationsPanel />
    </div>
  );
}