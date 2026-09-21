import { requireRole } from "@/lib/session";
import { CustomerDashboard } from "@/features/customer/customer-dashboard";

export const dynamic = "force-dynamic";

export default async function CustomerPage() {
  const user = await requireRole("CUSTOMER");
  return <CustomerDashboard role={user.role} />;
}