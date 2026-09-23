import { redirect } from "next/navigation";
import { CircleUserRound } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { ProfilePanel } from "@/features/engagement/profile-panel";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/profile");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CircleUserRound className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account details.</p>
        </div>
      </div>
      <ProfilePanel />
    </div>
  );
}