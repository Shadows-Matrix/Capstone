"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { ServiceFormDialog, type ServiceFormValues } from "./service-form-dialog";
import { formatCurrency } from "@/lib/utils";
import type { CategoryOption, MyService } from "@/features/provider/types";

export function useMyServices() {
  return useQuery({
    queryKey: ["my-services"],
    queryFn: () => apiFetch<MyService[]>("/api/v1/services/mine"),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<CategoryOption[]>("/api/v1/categories"),
  });
}

export function ProviderServicesManager() {
  const qc = useQueryClient();
  const { data: services, isLoading, error } = useMyServices();
  const [editing, setEditing] = useState<MyService | null>(null);
  const [creating, setCreating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (input: ServiceFormValues & { id?: string }) => {
      if (input.id) {
        return apiFetch<MyService>(`/api/v1/services/${input.id}`, { method: "PATCH", body: JSON.stringify(input) });
      }
      return apiFetch<MyService>("/api/v1/services", { method: "POST", body: JSON.stringify(input) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-services"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Service saved.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch<{ deleted: boolean }>(`/api/v1/services/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-services"] });
      toast.success("Service deleted.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <TriangleAlert className="size-4" />
        <AlertTitle>Could not load your services</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  const items = services ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} active service{items.length !== 1 ? "s" : ""} listed
        </p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-1 size-4" /> Add service
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          You haven&apos;t added any services yet. Create one to start receiving bookings.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <Card key={s.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary">{s.category.name}</Badge>
                  {!s.isActive && <Badge variant="outline">Hidden</Badge>}
                </div>
                <CardTitle className="text-base leading-snug">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                <p className="mt-3 font-semibold">
                  {formatCurrency(s.price)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">· {s.durationMins} min</span>
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(s)}>
                  <Pencil className="mr-1 size-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (confirm(`Delete "${s.title}"?`)) deleteMutation.mutate(s.id);
                  }}
                >
                  <Trash2 className="mr-1 size-3.5" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ServiceFormDialog
        open={creating || !!editing}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
        initial={editing}
        onSubmit={(values) => saveMutation.mutate({ ...values, id: editing?.id })}
        busy={saveMutation.isPending}
      />
    </div>
  );
}