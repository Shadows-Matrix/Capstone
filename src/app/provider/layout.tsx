import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Wrench, CircleUserRound } from "lucide-react";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  await requireRole("PROVIDER");
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Provider Hub</h1>
      <p className="text-sm text-muted-foreground">Manage your availability, bookings and services.</p>

      <Tabs defaultValue="dashboard" className="mt-6">
        <TabsList>
          <TabsTrigger value="dashboard" asChild>
            <Link href="/provider" className="flex items-center gap-1.5">
              <LayoutDashboard className="size-4" /> Dashboard
            </Link>
          </TabsTrigger>
          <TabsTrigger value="services" asChild>
            <Link href="/provider/services" className="flex items-center gap-1.5">
              <Wrench className="size-4" /> Services
            </Link>
          </TabsTrigger>
          <TabsTrigger value="profile" asChild>
            <Link href="/provider/profile" className="flex items-center gap-1.5">
              <CircleUserRound className="size-4" /> Profile
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">{children}</div>
    </div>
  );
}