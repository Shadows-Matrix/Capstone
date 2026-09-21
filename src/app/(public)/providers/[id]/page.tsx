import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RatingStars } from "@/components/common/rating-stars";
import { providerService } from "@/services/provider.service";
import { reviewRepository } from "@/repositories/review.repository";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Briefcase, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await providerService.getDetail(id);
    return { title: `${p.name} — Provider | SERVEX`, description: p.bio ?? undefined };
  } catch {
    return { title: "Provider — SERVEX" };
  }
}

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = await providerService.getDetail(id).catch(() => null);
  if (!provider) notFound();

  const reviews = await reviewRepository.listByProvider(provider.id).catch(() => []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/providers" className="hover:text-foreground">Providers</Link>
        <span className="mx-2">/</span>
        <span>{provider.name}</span>
      </nav>

      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
          <Avatar className="size-20 border">
            <AvatarImage src={provider.avatarUrl ?? undefined} alt={provider.name} />
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
              {provider.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{provider.name}</h1>
              {provider.isAvailable ? (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Available</Badge>
              ) : (
                <Badge variant="secondary">Busy</Badge>
              )}
            </div>
            <RatingStars rating={provider.ratingAvg} count={provider.ratingCount} className="mt-2" />
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" /> {provider.city}
                {provider.area ? ` · ${provider.area}` : ""}
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="size-4" /> {provider.completedJobs} jobs completed
              </span>
              <span> {provider.yearsExperience} years of experience</span>
            </div>
            {provider.bio && <p className="mt-4 text-muted-foreground">{provider.bio}</p>}
          </div>
        </CardContent>
      </Card>

      <h2 className="mt-8 text-xl font-bold">Services</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {provider.offerings.map((o) => (
          <Card key={o.id} className="hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">{o.categoryName}</Badge>
                <span className="text-sm font-bold">{formatCurrency(o.price)}</span>
              </div>
              <CardTitle className="text-base leading-snug">
                <Link href={`/services/${o.id}`} className="hover:underline">
                  {o.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="line-clamp-2 text-sm text-muted-foreground">{o.description}</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" /> {o.durationMins} min
                </span>
                <Button size="sm" asChild>
                  <Link href={`/services/${o.id}`}>Book now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-bold">Reviews</h2>
          <div className="mt-4 space-y-4">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.customer.name}</p>
                    <RatingStars rating={r.rating} />
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}