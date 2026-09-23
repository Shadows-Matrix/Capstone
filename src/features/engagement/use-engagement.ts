"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ServiceListItem } from "@/types";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  bookingId: string | null;
  createdAt: string;
};

export function useSavedServices() {
  return useQuery({
    queryKey: ["saved-services"],
    queryFn: () => apiFetch<ServiceListItem[]>("/api/v1/saved"),
  });
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId, saved }: { serviceId: string; saved: boolean }) => {
      if (saved) {
        await apiFetch(`/api/v1/saved?serviceId=${serviceId}`, { method: "DELETE" });
      } else {
        await apiFetch("/api/v1/saved", { method: "POST", body: JSON.stringify({ serviceId }) });
      }
      return !saved;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-services"] }),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<{ items: NotificationItem[]; unread: number }>("/api/v1/notifications"),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) =>
      apiFetch("/api/v1/notifications", { method: "PATCH", body: JSON.stringify({ ids }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export type ProfileMe = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
};

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<ProfileMe>("/api/v1/users/me"),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name?: string; phone?: string | null; city?: string | null }) =>
      apiFetch<ProfileMe>("/api/v1/users/me", { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: (data) => {
      qc.setQueryData(["profile"], data);
    },
  });
}
