import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Search, CalendarCheck2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us — SERVEX",
  description: "Learn what SERVEX is and why customers and providers trust it.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">About SERVEX</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        SERVEX is a hyperlocal services marketplace that connects customers with trusted,
        verified service professionals — from home cleaning and plumbing to electrical work,
        appliance repair and more. Our smart matching engine scores providers on rating,
        availability, location, price and track record, so every booking starts with confidence.
      </p>

      <h2 className="mt-10 text-2xl font-bold">How SERVEX works</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Search, title: "Discover", text: "Search services by keyword, category, city or price." },
          { icon: Star, title: "Connect", text: "Compare rated providers and pick the right match." },
          { icon: CalendarCheck2, title: "Get it done", text: "Book, track the job, and review on completion." },
        ].map((s) => (
          <div key={s.title} className="rounded-xl border bg-card p-5">
            <s.icon className="size-6 text-primary" />
            <h3 className="mt-3 font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-bold">Why customers choose us</h2>
      <ul className="mt-4 space-y-3 text-muted-foreground">
        <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /> Verified provider profiles with real customer reviews.</li>
        <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /> Transparent pricing in rupees — no hidden charges.</li>
        <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /> Live booking tracking from request to completion.</li>
      </ul>

      <div className="mt-10 flex gap-3">
        <Button asChild><Link href="/services">Explore services</Link></Button>
        <Button variant="outline" asChild><Link href="/register">Become a provider</Link></Button>
      </div>
    </div>
  );
}