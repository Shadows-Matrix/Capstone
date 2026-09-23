"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingMessages, useSendBookingMessage } from "@/features/bookings/use-bookings";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function BookingChat({ bookingId }: { bookingId: string }) {
  const { data: messages, isLoading } = useBookingMessages(bookingId);
  const send = useSendBookingMessage(bookingId);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages?.length]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || send.isPending) return;
    setText("");
    try {
      await send.mutateAsync(clean);
    } catch {
      setText(clean);
    }
  }

  return (
    <div className="mt-4 rounded-lg border bg-muted/40 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Messages for this booking
      </p>
      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {isLoading ? (
          <Skeleton className="h-12 rounded-lg" />
        ) : !messages || messages.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">
            No messages yet — say hello to coordinate the visit.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  m.mine ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground shadow-sm"
                )}
              >
                {!m.mine && <p className="mb-0.5 text-xs font-semibold opacity-70">{m.senderName}</p>}
                <p>{m.text}</p>
                <p className={cn("mt-0.5 text-[10px]", m.mine ? "opacity-70" : "text-muted-foreground")}>
                  {formatDateTime(m.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className="mt-2 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          maxLength={1000}
          className="bg-background"
        />
        <Button type="submit" size="icon" disabled={!text.trim() || send.isPending} aria-label="Send message">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}