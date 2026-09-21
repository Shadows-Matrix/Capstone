import type { BookingStatus, Role } from "@prisma/client";

// ---------- Services ----------
export type ServiceListItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  durationMins: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  category: { id: string; name: string; slug: string };
  provider: {
    id: string;
    name: string;
    city: string;
    area: string | null;
    isAvailable: boolean;
    ratingAvg: number;
    ratingCount: number;
  };
};

export type ServiceListResult = {
  items: ServiceListItem[];
  total: number;
  page: number;
  pageSize: number;
};

// ---------- Providers ----------
export type ProviderListItem = {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string;
  area: string | null;
  basePrice: number;
  isAvailable: boolean;
  completedJobs: number;
  yearsExperience: number;
  ratingAvg: number;
  ratingCount: number;
  offeringsCount: number;
};

export type ProviderDetail = ProviderListItem & {
  offerings: {
    id: string;
    title: string;
    description: string;
    price: number;
    durationMins: number;
    imageUrl: string | null;
    categoryName: string;
    categorySlug: string;
  }[];
};

// ---------- Bookings ----------
export type BookingDto = {
  id: string;
  status: BookingStatus;
  scheduledAt: string;
  address: string;
  notes: string | null;
  totalAmount: number;
  createdAt: string;
  service: { id: string; title: string; durationMins: number };
  customer: { id: string; name: string };
  provider: { id: string; name: string; city: string; phone: string | null };
  hasReview: boolean;
};

// ---------- Reviews ----------
export type ReviewDto = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customerName: string;
};

// ---------- Recommendations ----------
export type ScoredProvider = {
  rank: number;
  score: number;
  explanation: string;
  providerId: string;
  providerName: string;
  avatarUrl: string | null;
  city: string;
  area: string | null;
  isAvailable: boolean;
  completedJobs: number;
  ratingAvg: number;
  ratingCount: number;
  offering: {
    id: string;
    title: string;
    price: number;
    durationMins: number;
    categoryName: string;
  };
};

export type RecommendationInput = {
  serviceId?: string;
  categoryId?: string;
  city?: string;
  limit: number;
};

export type RecommendationFactors = {
  ratingScore: number;
  availabilityScore: number;
  locationScore: number;
  priceScore: number;
  completionScore: number;
};

// ---------- Admin ----------
export type AdminDashboardStats = {
  totals: {
    users: number;
    customers: number;
    providers: number;
    services: number;
    bookings: number;
  };
  bookingsByStatus: Record<BookingStatus, number>;
  revenueCompleted: number;
  avgPlatformRating: number;
  recentBookings: {
    id: string;
    status: BookingStatus;
    scheduledAt: string;
    totalAmount: number;
    serviceName: string;
    customerName: string;
    providerName: string;
  }[];
  topCategories: { name: string; bookings: number }[];
};

// ---------- Misc ----------
export type { BookingStatus, Role };

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
