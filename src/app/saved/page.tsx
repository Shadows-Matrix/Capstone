import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { SavedList } from "@/features/engagement/saved-list";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/saved");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Heart className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Saved services</h1>
          <p className="text-sm text-muted-foreground">Services you bookmarked for later.</p>
        </div>
      </div>
      <SavedList />
    </div>
  );
}