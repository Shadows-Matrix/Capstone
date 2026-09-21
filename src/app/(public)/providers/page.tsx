import type { Metadata } from "next";
import { ProviderCard } from "@/components/provider/provider-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { providerService } from "@/services/provider.service";
import { paginationSchema } from "@/lib/validation";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Providers — SERVEX",
  description: "Meet the vetted professionals on SERVEX.",
};

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const str = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const { page, pageSize } = paginationSchema.parse({ page: str(raw.page) ?? "1" });
  const q = str(raw.q) ?? "";
  const city = str(raw.city) ?? "";

  const [result, cities] = await Promise.all([
    providerService.list({ q: q || undefined, city: city || undefined, page, pageSize }),
    providerService.listCities().catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Find a trusted professional</h1>
      <p className="mt-1 text-muted-foreground">{result.total} providers available</p>

      <form method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input name="q" defaultValue={q} placeholder="Search by name or specialty…" className="flex-1" />
        <select
          name="city"
          defaultValue={city || ""}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-48"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button type="submit">Search</Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No providers found"
          text="Try a different search or check back soon."
        >
          <Button asChild size="sm">
            <a href="/providers">Clear filters</a>
          </Button>
        </EmptyState>
      ) : (
        <div className="mt-6 space-y-4">
          {result.items.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
}