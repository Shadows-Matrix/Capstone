import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/common/category-icon";
import { ServiceCard } from "@/components/service/service-card";
import { prisma } from "@/lib/prisma";
import type { ServiceListItem } from "@/types";

export const dynamic = "force-dynamic";

async function getLandingData() {
  const [categories, offerings, providerCount, customerCount] = await Promise.all([
    prisma.serviceCategory.findMany({ orderBy: { name: "asc" } }).catch(() => []),
    prisma.serviceOffering
      .findMany({
        where: { isActive: true },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          provider: {
            select: {
              id: true,
              city: true,
              area: true,
              isAvailable: true,
              user: { select: { name: true } },
              reviews: { select: { rating: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
      .catch(() => []),
    prisma.providerProfile.count().catch(() => 0),
    prisma.user.count({ where: { role: "CUSTOMER" } }).catch(() => 0),
  ]);

  const featured: ServiceListItem[] = offerings
    .map((o) => {
      const ratings = o.provider.reviews;
      const avg = ratings.length === 0 ? 0 : ratings.reduce((a, r) => a + r.rating, 0) / ratings.length;
      return {
        id: o.id,
        title: o.title,
        description: o.description,
        price: o.price,
        durationMins: o.durationMins,
        imageUrl: o.imageUrl,
        isActive: o.isActive,
        createdAt: o.createdAt.toISOString(),
        category: o.category,
        provider: {
          id: o.provider.id,
          name: o.provider.user.name,
          city: o.provider.city,
          area: o.provider.area,
          isAvailable: o.provider.isAvailable,
          ratingAvg: Math.round(avg * 10) / 10,
          ratingCount: ratings.length,
        },
      };
    })
    .sort((a, b) => b.provider.ratingAvg - a.provider.ratingAvg || b.provider.ratingCount - a.provider.ratingCount)
    .slice(0, 6);

  return { categories, featured, providerCount, customerCount };
}

export default async function HomePage() {
  const { categories, featured, providerCount, customerCount } = await getLandingData();

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Trusted professionals for every home task
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Book vetted cleaners, plumbers, electricians and more — matched to you by our smart recommendation engine.
            </p>
            <form
              action="/services"
              className="mx-auto mt-8 flex max-w-xl gap-2 rounded-full border bg-background p-1.5 shadow-sm"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="q"
                  placeholder="Search services, e.g. leaky faucet…"
                  className="w-full rounded-full bg-transparent py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" className="rounded-full">
                Search
              </Button>
            </form>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" /> Vetted professionals
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-primary" /> Same-week availability
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 text-primary" /> Reviewed by real customers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold">Browse by category</h2>
        {categories.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} href={`/services?category=${c.slug}`} className="group">
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CategoryIcon name={c.icon} className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{c.name}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {c.description ?? "Find trusted providers nearby"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {/* Featured services */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Top-rated services</h2>
            <Button variant="ghost" asChild>
              <Link href="/services">
                View all <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-center text-2xl font-bold">How SERVEX works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { step: "1", title: "Describe your task", text: "Tell us what you need and when — from a deep clean to an appliance fix." },
              { step: "2", title: "Get smart matches", text: "Our engine scores providers on rating, availability, location, price and track record." },
              { step: "3", title: "Book & relax", text: "Confirm your provider, track the job, pay on completion and leave a review." },
            ].map((s) => (
              <div key={s.step} className="rounded-xl bg-card p-6 text-center">
                <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {s.step}
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / stats */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold">Ready to get it done?</h2>
            <p className="mt-1 text-primary-foreground/80">
              {providerCount}+ professionals serving {customerCount}+ customers on SERVEX.
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/services">Find a pro</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Become a provider</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}