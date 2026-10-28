"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LayoutDashboard, LogIn, Menu, Store, Users, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "zustand/react";
import { authStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarketplaceNotificationBell } from "@/components/marketplace/marketplace-notification-bell";

function dashboardFor(role?: string, capabilities?: string[]) {
  if (capabilities?.includes("provider")) return "/provider/dashboard";
  if (role === "recruiter") return "/recruiter/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/talent/dashboard";
}

export function PublicMarketplaceHeader() {
  const pathname = usePathname();
  const user = useStore(authStore, (state) => state.user);
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/services", label: "Services", icon: Briefcase },
    { href: "/providers", label: "Providers", icon: Users },
  ];
  const accountLinks = user
    ? [{ href: "/inquiries", label: "My inquiries" }]
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Store className="size-4" />
          </span>
          <span>RootIn Marketplace</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {accountLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <MarketplaceNotificationBell />
              <Button asChild variant="outline">
                <Link href={dashboardFor(user.role, user.account_capabilities)}>
                  <LayoutDashboard className="mr-2 size-4" />
                  Dashboard
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Join as provider</Link>
              </Button>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          {user && <MarketplaceNotificationBell />}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link
                href={dashboardFor(user.role, user.account_capabilities)}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                <LogIn className="size-4" />
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
