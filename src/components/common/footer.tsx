import Link from "next/link";
import { Wrench } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 font-bold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wrench className="size-3.5" />
          </span>
          SERVEX
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/services" className="hover:text-foreground">Services</Link>
          <Link href="/providers" className="hover:text-foreground">Providers</Link>
          <Link href="/register" className="hover:text-foreground">Become a provider</Link>
        </nav>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SERVEX. All rights reserved.</p>
      </div>
    </footer>
  );
}
