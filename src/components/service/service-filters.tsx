"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useTransition } from "react";

type Option = { value: string; label: string };

export function ServiceFilters({
  categories,
  cities,
}: {
  categories: Option[];
  cities: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");

  function apply(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined || value === "") sp.delete(key);
      else sp.set(key, value);
    }
    sp.delete("page");
    startTransition(() => router.push(`/services?${sp.toString()}`));
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <form
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
      >
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search services or providers…"
          className="pl-9"
        />
      </form>
      <Select
        value={params.get("category") ?? "all"}
        onValueChange={(v) => apply({ category: v === "all" ? undefined : v })}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={params.get("city") ?? "all"}
        onValueChange={(v) => apply({ city: v === "all" ? undefined : v })}
      >
        <SelectTrigger className="w-full md:w-44">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All cities</SelectItem>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={params.get("sort") ?? "rating"}
        onValueChange={(v) => apply({ sort: v })}
      >
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating">Top rated</SelectItem>
          <SelectItem value="price-asc">Price: low to high</SelectItem>
          <SelectItem value="price-desc">Price: high to low</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
        </SelectContent>
      </Select>
      {(params.get("q") || params.get("category") || params.get("city") || params.get("minPrice") || params.get("maxPrice")) && (
        <Button variant="ghost" onClick={() => startTransition(() => router.push("/services"))}>
          Clear
        </Button>
      )}
      <form
        className="flex w-full gap-2 md:w-auto"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined });
        }}
      >
        <Input
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
          placeholder="Min ₹"
          inputMode="numeric"
          className="w-full md:w-24"
        />
        <Input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
          placeholder="Max ₹"
          inputMode="numeric"
          className="w-full md:w-24"
        />
        <Button type="submit" variant="outline" size="icon" aria-label="Apply price filter">
          ₹
        </Button>
      </form>
      {isPending && <span className="text-xs text-muted-foreground">Updating…</span>}
    </div>
  );
}
