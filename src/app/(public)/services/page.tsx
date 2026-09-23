import type { Metadata } from "next";
import { ServiceFilters } from "@/components/service/service-filters";
import { ServiceCard } from "@/components/service/service-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { serviceService } from "@/services/service.service";
import { serviceFilterSchema } from "@/lib/validation";
import { SearchX } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services — SERVEX",
  description: "Browse and book trusted home service professionals.",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const stringify = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const filter = serviceFilterSchema.parse({
    q: stringify(raw.q) ?? undefined,
    category: stringify(raw.category) ?? undefined,
    city: stringify(raw.city) ?? undefined,
    sort: stringify(raw.sort) ?? "rating",
    page: stringify(raw.page) ?? "1",
    minPrice: stringify(raw.minPrice) ?? undefined,
    maxPrice: stringify(raw.maxPrice) ?? undefined,
  });

  const [result, categories, cities] = await Promise.all([
    serviceService.list(filter),
    prisma.serviceCategory.findMany({ orderBy: { name: "asc" } }).catch(() => []),
    serviceService.listCities().catch(() => []),
  ]);

  function pageHref(page: number) {
    const sp = new URLSearchParams();
    if (filter.q) sp.set("q", filter.q);
    if (filter.category) sp.set("category", filter.category);
    if (filter.city) sp.set("city", filter.city);
    if (filter.sort) sp.set("sort", filter.sort);
    if (filter.minPrice !== undefined) sp.set("minPrice", String(filter.minPrice));
    if (filter.maxPrice !== undefined) sp.set("maxPrice", String(filter.maxPrice));
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    return `/services${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground">{result.total} service{result.total !== 1 ? "s" : ""} available</p>
      </div>

      <div className="mt-6">
        <ServiceFilters categories={categories.map((c) => ({ value: c.slug, label: c.name }))} cities={cities} />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No services match your filters"
          text="Try a different keyword, category, or location."
        />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}

      {result.total > result.pageSize && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={filter.page <= 1} asChild>
            <a href={pageHref(filter.page - 1)}>Previous</a>
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filter.page} of {Math.max(1, Math.ceil(result.total / result.pageSize))}
          </span>
          <Button
            variant="outline"
            disabled={filter.page * result.pageSize >= result.total}
            asChild
          >
            <a href={pageHref(filter.page + 1)}>Next</a>
          </Button>
        </div>
      )}
    </div>
  );
}