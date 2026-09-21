"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCreateReview } from "@/features/bookings/use-bookings";

export function ReviewDialog({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const createReview = useCreateReview();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please select a star rating.");
      return;
    }
    try {
      await createReview.mutateAsync({ bookingId, rating, comment: comment || undefined });
      toast.success("Thanks for your review!");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Leave review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your experience</DialogTitle>
          <DialogDescription>Your feedback helps others choose great providers.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex justify-center gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i} star${i > 1 ? "s" : ""}`}
                className="rounded p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(i)}
              >
                <Star
                  className={cn(
                    "size-8",
                    (hovered || rating) >= i
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40"
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How did it go? (optional)"
            rows={3}
            maxLength={1000}
          />
          <DialogFooter>
            <Button type="submit" disabled={createReview.isPending} className="w-full">
              {createReview.isPending ? "Submitting…" : "Submit review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
