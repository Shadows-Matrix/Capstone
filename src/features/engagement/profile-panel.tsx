"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useProfile, useUpdateProfile } from "@/features/engagement/use-engagement";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().max(24).optional(),
  city: z.string().max(80).optional(),
});

export function ProfilePanel() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", city: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({ name: profile.name, phone: profile.phone ?? "", city: profile.city ?? "" });
    }
  }, [profile, form]);

  if (isLoading || !profile) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      await update.mutateAsync({
        name: values.name,
        phone: values.phone || null,
        city: values.city || null,
      });
      toast.success("Profile updated.");
    } catch {
      toast.error("Could not update profile.");
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-medium">{profile.email}</p>
          <Badge variant="secondary" className="mt-1">{profile.role}</Badge>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl><Input placeholder="e.g. Mumbai" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
}