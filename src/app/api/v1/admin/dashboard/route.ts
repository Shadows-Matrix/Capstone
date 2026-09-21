import { handleRoute, ok } from "@/lib/api";
import { requireRole } from "@/lib/session";
import { adminService } from "@/services/admin.service";

export async function GET() {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    const stats = await adminService.getDashboardStats();
    return ok(stats);
  });
}
