import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Create account — SERVEX",
  description: "Join SERVEX as a customer or provider.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join as a customer or a service provider.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}