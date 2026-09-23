import Link from "next/link";
import { Wrench } from "lucide-react";

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Marketplace",
    links: [
      { href: "/services", label: "Browse services" },
      { href: "/providers", label: "Find providers" },
      { href: "/register", label: "Become a provider" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/#how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 font-bold">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Wrench className="size-3.5" />
              </span>
              SERVEX
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Trusted professionals for every home task — discover, book and manage
              services in one place.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <nav className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <Link key={l.href + l.label} href={l.href} className="hover:text-foreground">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} SERVEX. All rights reserved.</p>
          <p>Tiruchirappalli, Tamil Nadu · support@servex.local</p>
        </div>
      </div>
    </footer>
  );
}