"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSavedServices, useToggleSave } from "@/features/engagement/use-engagement";
import { cn } from "@/lib/utils";

export function SaveButton({ serviceId }: { serviceId: string }) {
  const { data: session } = useSession();
  const { data: saved = [] } = useSavedServices();
  const toggle = useToggleSave();

  if (!session) return null;

  const isSaved = saved.some((s) => s.id === serviceId);

  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label={isSaved ? "Unsave service" : "Save service"}
      disabled={toggle.isPending}
      onClick={async () => {
        try {
          await toggle.mutateAsync({ serviceId, saved: isSaved });
          toast.success(isSaved ? "Removed from saved." : "Saved for later.");
        } catch {
          toast.error("Could not update saved services.");
        }
      }}
    >
      <Heart className={cn("size-4", isSaved && "fill-destructive text-destructive")} />
    </Button>
  );
}