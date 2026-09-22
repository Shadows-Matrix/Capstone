"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { apiFetch } from "@/lib/api-client";

const passwordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

function dashboardFor(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "PROVIDER") return "/provider";
  return "/customer";
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
  });

  async function finish(result: { error?: string | null; ok?: boolean }, role: string) {
    if (result?.error) {
      setError("Sign-in failed. Please try again.");
      return;
    }
    toast.success("Signed in successfully.");
    router.push(callbackUrl || dashboardFor(role));
    router.refresh();
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    setError("");
    setBusy(true);
    try {
      const res = await apiFetch<{
        requiresOtp: boolean;
        challengeId?: string;
        devCode?: string;
      }>("/api/v1/auth/otp/request", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (!res.requiresOtp) {
        // Admins sign in with password directly.
        const result = await signIn("credentials", { redirect: false, ...values });
        await finish(result ?? {}, "ADMIN");
        return;
      }

      setEmail(values.email);
      setChallengeId(res.challengeId ?? null);
      setDevCode(res.devCode ?? null);
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function onOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!challengeId || code.length !== 6) return;
    setError("");
    setBusy(true);
    try {
      const res = await apiFetch<{ email: string; loginToken: string }>(
        "/api/v1/auth/otp/verify",
        {
          method: "POST",
          body: JSON.stringify({ challengeId, code }),
        }
      );
      const result = await signIn("credentials", {
        redirect: false,
        email: res.email,
        password: "",
        loginToken: res.loginToken,
      });
      // Role comes from the verified account — route by e-mail domain is
      // unreliable, so fall back to the customer dashboard; middleware
      // re-routes providers/admins to their own dashboards.
      await finish(result ?? {}, "CUSTOMER");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!email) return;
    setError("");
    setBusy(true);
    try {
      const values = form.getValues();
      const res = await apiFetch<{ requiresOtp: boolean; challengeId?: string; devCode?: string }>(
        "/api/v1/auth/otp/request",
        { method: "POST", body: JSON.stringify({ email, password: values.password }) }
      );
      setChallengeId(res.challengeId ?? null);
      setDevCode(res.devCode ?? null);
      setCode("");
      toast.success("A new code was sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setBusy(false);
    }
  }

  // ---------- Step 2: OTP ----------
  if (challengeId) {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="text-center">
          <p className="font-medium">Check your messages</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium">{email}</span>. It expires in 10 minutes.
          </p>
          {devCode && (
            <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm">
              Demo code: <span className="font-mono font-bold tracking-widest">{devCode}</span>
            </p>
          )}
        </div>
        <form onSubmit={onOtpSubmit} className="flex flex-col items-center gap-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            maxLength={6}
            className="h-12 text-center font-mono text-2xl tracking-[0.5em]"
          />
          <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
            {busy ? "Verifying…" : "Verify & sign in"}
          </Button>
        </form>
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setChallengeId(null);
              setCode("");
              setError("");
            }}
          >
            ← Back
          </button>
          <button
            type="button"
            className="font-medium text-primary hover:underline disabled:opacity-50"
            onClick={resend}
            disabled={busy}
          >
            Resend code
          </button>
        </div>
      </div>
    );
  }

  // ---------- Step 1: password ----------
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
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
                  <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Checking…" : "Continue"}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}