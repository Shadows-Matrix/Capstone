import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingStars } from "@/components/common/rating-stars";
import { BookingDialog } from "@/components/service/booking-dialog";
import { ServiceCard } from "@/components/service/service-card";
import { serviceService } from "@/services/service.service";
import { recommendationService } from "@/services/recommendation.service";
import { reviewRepository } from "@/repositories/review.repository";
import { formatCurrency } from "@/lib/utils";
import type { ServiceListItem } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const service = await serviceService.getById(id);
    return { title: `${service.title} — SERVEX`, description: service.description };
  } catch {
    return { title: "Service — SERVEX" };
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await serviceService.getById(id).catch(() => null);
  if (!service) notFound();

  const [recommendations, reviews] = await Promise.all([
    recommendationService
      .recommend({ serviceId: id, city: service.provider.city, limit: 3 })
      .catch(() => []),
    reviewRepository.listByProvider(service.provider.id).catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/services" className="hover:text-foreground">Services</Link>
        <span className="mx-2">/</span>
        <span>{service.category.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{service.category.name}</Badge>
                {service.provider.isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <span className="size-1.5 rounded-full bg-emerald-500" /> Available now
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Provider busy</span>
                )}
              </div>
              <CardTitle className="text-2xl font-bold leading-tight">{service.title}</CardTitle>
              <RatingStars rating={service.provider.ratingAvg} count={service.provider.ratingCount} />
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{service.description}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary" />
                  {service.provider.city}
                  {service.provider.area ? ` · ${service.provider.area}` : ""}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-primary" /> {service.durationMins} minutes
                </span>
                <Link
                  href={`/providers/${service.provider.id}`}
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  <BadgeCheck className="size-4" /> {service.provider.name}
                </Link>
              </div>
            </CardContent>
          </Card>

          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{r.customer.name}</p>
                      <RatingStars rating={r.rating} />
                    </div>
                    {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sticky booking panel */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold">{formatCurrency(service.price)}</p>
                <p className="text-sm text-muted-foreground">/ visit</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {service.durationMins} minutes · one-time service
              </p>
              <div className="mt-4">
                <BookingDialog serviceId={service.id} serviceTitle={service.title} price={service.price} />
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Free cancellation before confirmation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Similar services with great matches</h2>
          <p className="text-sm text-muted-foreground">Recommended by our smart matching engine.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((r) => {
              const recService: ServiceListItem = {
                id: r.offering.id,
                title: r.offering.title,
                description: r.explanation,
                price: r.offering.price,
                durationMins: r.offering.durationMins,
                imageUrl: null,
                isActive: true,
                createdAt: "",
                category: { id: "", name: r.offering.categoryName, slug: "" },
                provider: {
                  id: r.providerId,
                  name: r.providerName,
                  city: r.city,
                  area: r.area,
                  isAvailable: r.isAvailable,
                  ratingAvg: r.ratingAvg,
                  ratingCount: r.ratingCount,
                },
              };
              return (
                <div key={r.offering.id} className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm">
                    <span className="font-semibold text-primary">#{r.rank} match · {r.score}%</span>
                    <span className="text-xs text-muted-foreground">Smart match</span>
                  </div>
                  <ServiceCard service={recService} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-8 flex justify-center">
        <Button variant="outline" asChild>
          <Link href={`/providers/${service.provider.id}`}>View provider&apos;s full profile</Link>
        </Button>
      </div>
    </div>
  );
}