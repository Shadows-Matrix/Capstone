import { z } from "zod";

// ---------- Auth (email OTP — passwordless for customers/providers) ----------
export const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

// ---------- Services ----------
export const serviceCreateSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  price: z.number().positive("Price must be greater than 0").max(100000),
  durationMins: z.number().int().min(15).max(600).default(60),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

// ---------- Bookings ----------
const futureDate = (val: unknown) => {
  if (!(val instanceof Date)) return false;
  return val.getTime() > Date.now();
};

export const bookingCreateSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  scheduledAt: z.coerce
    .date()
    .refine(futureDate, "Scheduled time must be in the future"),
  address: z.string().min(5, "Address is required").max(300),
  notes: z.string().max(1000).optional(),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

// ---------- Reviews ----------
export const reviewCreateSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  comment: z.string().max(1000).optional(),
});

// ---------- OTP ----------
export const otpRequestSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const otpVerifySchema = z.object({
  challengeId: z.string().min(1, "Challenge is required"),
  code: z
    .string()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

// Details collected from a verified-new email before account creation.
export const signupCompleteSchema = z
  .object({
    signupToken: z.string().min(1, "Verification is required"),
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    role: z.enum(["CUSTOMER", "PROVIDER"]),
    phone: z.string().max(24).optional(),
    city: z.string().max(80).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "PROVIDER" && !data.city?.trim()) {
      ctx.addIssue({ code: "custom", path: ["city"], message: "City is required for provider accounts" });
    }
  });

// ---------- Recommendations ----------
export const recommendationQuerySchema = z
  .object({
    serviceId: z.string().min(1).optional(),
    categoryId: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(20).default(5),
  })
  .refine((q) => q.serviceId || q.categoryId, {
    message: "serviceId or categoryId is required",
    path: ["serviceId"],
  });

// ---------- Provider profile ----------
export const providerProfileUpdateSchema = z.object({
  bio: z.string().max(2000).optional(),
  city: z.string().min(1).max(80).optional(),
  area: z.string().max(80).optional(),
  basePrice: z.number().min(0).max(100000).optional(),
  isAvailable: z.boolean().optional(),
  yearsExperience: z.number().int().min(0).max(70).optional(),
});

// ---------- Query helpers ----------
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export const serviceFilterSchema = paginationSchema.extend({
  category: z.string().optional(),
  city: z.string().optional(),
  q: z.string().max(120).optional(),
  sort: z.enum(["price-asc", "price-desc", "rating", "newest"]).default("rating"),
});
