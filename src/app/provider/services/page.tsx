import { requireRole } from "@/lib/session";
import { ProviderServicesManager } from "@/features/provider/provider-services";

export const dynamic = "force-dynamic";

export default async function ProviderServicesPage() {
  await requireRole("PROVIDER");
  return <ProviderServicesManager />;
}