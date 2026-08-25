"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Search, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "talent" | "recruiter" | "admin" | null;

export function MobileBottomNav({ role = null }: { role?: Role }) {
  const pathname = usePathname();

  const base = role ?? "";
  const items = [
    {
      label: "Home",
      icon: Home,
      href: role ? `/${base}/dashboard` : "/auth/login",
      isActive:
        !!role && pathname.startsWith(`/${base}/dashboard`),
    },
    {
      label: "Search",
      icon: Search,
      href:
        role === "recruiter"
          ? "/recruiter/find-talent"
          : role
            ? `/${base}/opportunities`
            : "/auth/login",
      isActive:
        role === "recruiter"
          ? pathname.startsWith("/recruiter/find-talent")
          : !!role && pathname.startsWith(`/${base}/opportunities`),
    },
    {
      label: "Messages",
      icon: MessageSquare,
      href: role ? `/${base}/messages` : "/auth/login",
      isActive: !!role && pathname.startsWith(`/${base}/messages`),
    },
    {
      label: "Shortlists",
      icon: Star,
      href:
        role === "recruiter"
          ? "/recruiter/campaigns"
          : role
            ? `/${base}/requests`
            : "/auth/login",
      isActive:
        role === "recruiter"
          ? pathname.startsWith("/recruiter/campaigns")
          : !!role && pathname.startsWith(`/${base}/requests`),
    },
    {
      label: "Profile",
      icon: User,
      href: role ? `/${base}/profile` : "/auth/login",
      isActive:
        !!role &&
        /^\/(talent|recruiter|admin)\/profile(\/|$)/.test(pathname),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg-surface/95 backdrop-blur-xl lg:hidden">
      <ul className="mx-auto flex max-w-lg items-center justify-between px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 sm:px-6">
        {items.map((item) => (
          <li key={item.label} className="flex-1">
            <Link
              href={item.href}
              className={cn(
                "mx-auto flex w-fit min-w-14 flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors",
                item.isActive
                  ? "text-rootin"
                  : "text-muted-foreground/70 hover:text-foreground",
              )}
            >
              <item.icon width={20} height={20} />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
