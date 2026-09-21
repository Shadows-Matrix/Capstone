import { fail, handleRoute, ok } from "@/lib/api";
import { requireRole } from "@/lib/session";
import { isCloudinaryConfigured, signUpload } from "@/services/upload.service";

export async function GET() {
  return handleRoute(async () => {
    await requireRole("PROVIDER", "ADMIN");
    if (!isCloudinaryConfigured()) {
      return fail(
        503,
        "Uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
        "UPLOADS_DISABLED"
      );
    }
    return ok(signUpload());
  });
}

export async function POST() {
  return GET();
}
