"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerDashboard } from "@/features/customer/customer-dashboard";
import { BookUser } from "lucide-react";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookUser className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">My bookings</h1>
          <p className="text-sm text-muted-foreground">Manage your service appointments from one place.</p>
        </div>
      </div>
      {children}
    </div>
  );
}