import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in — SERVEX",
  description: "Sign in or create your SERVEX account with email verification.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; email?: string }>;
}) {
  const { callbackUrl, email } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to SERVEX</CardTitle>
          <CardDescription>Sign in or sign up with email verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm callbackUrl={callbackUrl} initialEmail={email} />
        </CardContent>
      </Card>
    </div>
  );
}