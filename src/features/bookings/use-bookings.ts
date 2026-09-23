"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { BookingDto, BookingStatus, ReviewDto } from "@/types";

export type BookingMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  mine: boolean;
  createdAt: string;
};

export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => apiFetch<BookingDto[]>("/api/v1/bookings"),
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      apiFetch<BookingDto>(`/api/v1/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { bookingId: string; rating: number; comment?: string }) =>
      apiFetch<ReviewDto>("/api/v1/reviews", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useBookingMessages(bookingId: string | null) {
  return useQuery({
    queryKey: ["booking-messages", bookingId],
    queryFn: () => apiFetch<BookingMessage[]>(`/api/v1/bookings/${bookingId}/messages`),
    enabled: !!bookingId,
    refetchInterval: 5000,
  });
}

export function useSendBookingMessage(bookingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) =>
      apiFetch<BookingMessage>(`/api/v1/bookings/${bookingId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking-messages", bookingId] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
