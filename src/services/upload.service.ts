import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "@/lib/api";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

/**
 * Generates a signed upload payload. The client uploads directly to Cloudinary
 * — no file bytes ever pass through this server (serverless-friendly).
 */
export function signUpload(folder = "servex"): UploadSignature {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      503,
      "File uploads are not configured. Set CLOUDINARY_* environment variables to enable uploads.",
      "UPLOADS_DISABLED"
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, process.env.CLOUDINARY_API_SECRET!);

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder,
  };
}
