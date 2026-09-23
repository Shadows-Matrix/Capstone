"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Wrench, LayoutDashboard, LogOut, Menu, Heart, Bell, CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const publicLinks = [
  { href: "/services", label: "Services" },
  { href: "/providers", label: "Providers" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

function dashboardHref(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "PROVIDER") return "/provider";
  return "/customer";
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const role = session?.user?.role;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </span>
            SERVEX
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {publicLinks.map((l) => (
              <Button key={l.href} variant="ghost" asChild>
                <Link href={l.href}>{l.label}</Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? null : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full outline-none ring-primary focus-visible:ring-2">
                  <Avatar className="size-9">
                    <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? ""} />
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {(session.user?.name ?? "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{session.user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{session.user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref(role)}>
                    <LayoutDashboard className="mr-2 size-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/saved">
                    <Heart className="mr-2 size-4" /> Saved services
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications">
                    <Bell className="mr-2 size-4" /> Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <CircleUserRound className="mr-2 size-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Wrench className="size-3.5" />
              </span>
              SERVEX
            </SheetTitle>
            <nav className="mt-6 flex flex-col gap-1">
              {publicLinks.map((l) => (
                <Button key={l.href} variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
                  <Link href={l.href}>{l.label}</Link>
                </Button>
              ))}
              {session ? (
                <>
                  <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
                    <Link href={dashboardHref(role)}>
                      <LayoutDashboard className="mr-2 size-4" /> Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-destructive"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 size-4" /> Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button className="justify-start" asChild onClick={() => setOpen(false)}>
                    <Link href="/register">Get started</Link>
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
