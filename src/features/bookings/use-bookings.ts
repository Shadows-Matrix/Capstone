"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { BookingDto, BookingStatus, ReviewDto } from "@/types";

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
