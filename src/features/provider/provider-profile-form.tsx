"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { useProviderProfile } from "@/features/provider/provider-dashboard";
import type { ProviderMe } from "@/features/provider/types";

const schema = z.object({
  bio: z.string().max(2000).optional(),
  city: z.string().min(1, "City is required").max(80),
  area: z.string().max(80).optional(),
  basePrice: z.number().finite("Enter a valid price").min(0).max(100000),
  yearsExperience: z.number().finite("Enter valid years").int().min(0).max(70),
});

export function ProviderProfileForm() {
  const { data: me, isLoading } = useProviderProfile();
  const qc = useQueryClient();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { bio: "", city: "", area: "", basePrice: 0, yearsExperience: 0 },
  });

  useEffect(() => {
    if (me) {
      form.reset({
        bio: me.bio ?? "",
        city: me.city,
        area: me.area ?? "",
        basePrice: me.basePrice,
        yearsExperience: me.yearsExperience,
      });
    }
  }, [me, form]);

  const save = useMutation({
    mutationFn: (values: z.infer<typeof schema>) =>
      apiFetch<ProviderMe>("/api/v1/providers/me", { method: "PATCH", body: JSON.stringify(values) }),
    onSuccess: (data) => {
      qc.setQueryData(["provider-me"], data);
      toast.success("Profile updated.");
    },
    onError: () => toast.error("Could not update profile."),
  });

  if (isLoading || !me) return <Skeleton className="h-72 rounded-xl" />;

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="text-lg font-semibold">Public profile</h2>
      <p className="text-sm text-muted-foreground">This is what customers see on your provider page.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="mt-4 space-y-4">
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl><Textarea rows={3} placeholder="Tell customers about your experience…" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl><Input placeholder="e.g. Andheri West" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting price (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number" min={0} step={10}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearsExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of experience</FormLabel>
                  <FormControl>
                    <Input
                      type="number" min={0} max={70} step={1}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
}