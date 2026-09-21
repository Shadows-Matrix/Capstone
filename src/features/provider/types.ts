export type ProviderMe = {
  id: string;
  name: string;
  email: string;
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
};

export type CategoryOption = { id: string; name: string; slug: string };

export type MyService = {
  id: string;
  title: string;
  description: string;
  price: number;
  durationMins: number;
  imageUrl: string | null;
  isActive: boolean;
  category: { id: string; name: string; slug: string };
};
