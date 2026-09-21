"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import type { BookingDto } from "@/types";

export function BookingDialog({
  serviceId,
  serviceTitle,
  price,
}: {
  serviceId: string;
  serviceTitle: string;
  price: number;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const minDatetime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduledAt || address.trim().length < 5) {
      toast.error("Please pick a future date/time and enter your address.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch<BookingDto>("/api/v1/bookings", {
        method: "POST",
        body: JSON.stringify({ serviceId, scheduledAt: new Date(scheduledAt).toISOString(), address, notes: notes || undefined }),
      });
      toast.success("Booking requested! The provider will confirm shortly.");
      setOpen(false);
      router.push("/customer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          Book now — ${price}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book &quot;{serviceTitle}&quot;</DialogTitle>
          <DialogDescription>
            Pick a time and share the job location. The provider will confirm your request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Date &amp; time</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              min={minDatetime}
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Service address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city"
              minLength={5}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the issue or any special requests…"
              rows={3}
            />
          </div>
          <DialogFooter>
            {status === "unauthenticated" ? (
              <Button
                type="button"
                className="w-full"
                onClick={() => router.push(`/login?callbackUrl=/services/${serviceId}`)}
              >
                Log in to book
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="w-full">
                <CalendarClock className="mr-2 size-4" />
                {loading ? "Requesting…" : "Confirm booking request"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
