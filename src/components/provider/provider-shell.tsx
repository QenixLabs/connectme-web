"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Store,
  UserRound,
} from "lucide-react";
import { useStore } from "zustand/react";
import { authStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarketplaceNotificationBell } from "@/components/marketplace/marketplace-notification-bell";

const NAV_ITEMS = [
  { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/provider/profile", label: "Profile", icon: UserRound },
  { href: "/provider/services", label: "Services", icon: Briefcase },
  { href: "/provider/inquiries", label: "Inquiries", icon: ClipboardList },
  { href: "/provider/messages", label: "Messages", icon: MessageSquare },
];

export function ProviderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStore(authStore, (state) => state.user);
  const logout = useStore(authStore, (state) => state.logout);

  if (pathname.startsWith("/provider/onboarding")) {
    return <>{children}</>;
  }

  const initials =
    (user?.username || user?.email || "P")
      .split(/[\s@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P";

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/provider/dashboard" className="flex items-center gap-2 font-bold">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="size-4" />
            </span>
            <span className="hidden sm:inline">Provider Studio</span>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {user && <MarketplaceNotificationBell />}
            <Link
              href="/services"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline"
            >
              View marketplace
            </Link>
            <Avatar className="size-9">
              <AvatarImage src={undefined} alt="Provider" />
              <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Log out"
              onClick={handleLogout}
              className="rounded-full"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
