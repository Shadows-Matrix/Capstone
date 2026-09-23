import { requireRole } from "@/lib/session";
import { ProviderProfileForm } from "@/features/provider/provider-profile-form";

export const dynamic = "force-dynamic";

export default async function ProviderProfilePage() {
  await requireRole("PROVIDER");
  return <ProviderProfileForm />;
}