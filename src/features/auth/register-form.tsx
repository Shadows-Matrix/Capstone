"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Briefcase } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain a letter")
      .regex(/[0-9]/, "Password must contain a number"),
    role: z.enum(["CUSTOMER", "PROVIDER"]),
    phone: z.string().max(24).optional(),
    city: z.string().max(80).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "PROVIDER" && !data.city?.trim()) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "City is required for provider accounts" });
    }
  });

type RegisterValues = z.infer<typeof schema>;

function dashboardFor(role: "CUSTOMER" | "PROVIDER") {
  return role === "PROVIDER" ? "/provider" : "/customer";
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "CUSTOMER", city: "" },
  });

  const role = form.watch("role");

  async function onSubmit(values: RegisterValues) {
    setError("");
    try {
      await apiFetch("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
      });
      const result = await signIn("credentials", { redirect: false, email: values.email, password: values.password });
      if (result?.error) throw new Error("Account created, but auto sign-in failed. Please log in.");
      toast.success("Welcome to SERVEX!");
      router.push(params.get("callbackUrl") || dashboardFor(values.role));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => form.setValue("role", "CUSTOMER")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-4 text-sm font-medium transition-colors",
                role === "CUSTOMER" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/40"
              )}
            >
              <User className="size-5" />
              I&apos;m a customer
            </button>
            <button
              type="button"
              onClick={() => form.setValue("role", "PROVIDER")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-4 text-sm font-medium transition-colors",
                role === "PROVIDER" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground/40"
              )}
            >
              <Briefcase className="size-5" />
              I&apos;m a provider
            </button>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="At least 8 characters" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {role === "PROVIDER" && (
            <>
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City where you work</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 555 000 1234" autoComplete="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}