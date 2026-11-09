"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "zustand/react";
import { ClipboardList, Home, MessageSquare, ShoppingBag, UserRound } from "lucide-react";
import { authStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

function profileHref(role?: string, capabilities?: string[]) {
  if (capabilities?.includes("provider") || role === "provider") return "/provider/profile";
  if (role === "recruiter") return "/recruiter/profile";
  if (role === "admin") return "/admin/dashboard";
  return "/talent/profile";
}

export function MobileMarketplaceNav() {
  const pathname = usePathname();
  const user = useStore(authStore, (state) => state.user);
  if (/^\/services\/[^/]+$/.test(pathname)) return null;
  const messagesHref = user
    ? user.account_capabilities?.includes("provider") || user.role === "provider"
      ? "/provider/messages"
      : user.role === "recruiter"
        ? "/recruiter/messages"
        : "/talent/messages"
    : "/auth/login";
  const items = [
    { href: "/", label: "Home", icon: Home, active: pathname === "/" },
    { href: "/services", label: "Services", icon: ShoppingBag, active: pathname.startsWith("/services") },
    { href: "/inquiries", label: "Orders", icon: ClipboardList, active: pathname === "/inquiries" },
    {
      href: messagesHref,
      label: "Messages",
      icon: MessageSquare,
      active:
        pathname.startsWith("/provider/messages") ||
        pathname.startsWith("/recruiter/messages") ||
        pathname.startsWith("/talent/messages") ||
        pathname.startsWith("/inquiries/"),
    },
    {
      href: user ? profileHref(user.role, user.account_capabilities) : "/auth/login",
      label: "Profile",
      icon: UserRound,
      active: pathname.startsWith("/provider/profile") || pathname.startsWith("/recruiter/profile") || pathname.startsWith("/talent/profile"),
    },
  ];

  return (
    <nav
      aria-label="Marketplace navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-xl grid-cols-5">
        {items.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={label}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
              active ? "text-blue-600" : "text-slate-500 hover:text-slate-900",
            )}
          >
            <span className={cn("grid size-8 place-items-center rounded-xl", active && "bg-blue-50")}>
              <Icon className="size-[18px]" />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
