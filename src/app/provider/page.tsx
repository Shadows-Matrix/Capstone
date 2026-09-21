import { requireRole } from "@/lib/session";
import { ProviderDashboard } from "@/features/provider/provider-dashboard";

export const dynamic = "force-dynamic";

export default async function ProviderPage() {
  await requireRole("PROVIDER");
  return <ProviderDashboard />;
}