"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Clapperboard,
  UsersRound,
  Wrench,
} from "lucide-react";
import { useStore } from "zustand/react";
import { cn } from "@/lib/utils";
import { authStore } from "@/stores/auth-store";

export type DiscoveryMode = "opportunities" | "recruiters" | "talent" | "services";

interface DiscoveryTabsProps {
  searchTerm?: string;
  mode?: DiscoveryMode;
  onModeChange?: (mode: DiscoveryMode) => void;
}

export function DiscoveryTabs({
  searchTerm,
  mode,
  onModeChange,
}: DiscoveryTabsProps = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useStore(authStore, (state) => state.user);
  const isOpportunities = pathname.startsWith("/talent/opportunities");
  const view = isOpportunities ? searchParams.get("view") : null;
  const isRecruiters = view === "recruiters";
  const isServices = view === "services";
  const isTalentDiscovery = pathname.startsWith("/talent/opportunities");
  const search = (searchTerm ?? searchParams.get("search") ?? "").trim();

  const addSearch = (href: string) =>
    search
      ? `${href}${href.includes("?") ? "&" : "?"}search=${encodeURIComponent(search)}`
      : href;
  const tabs: {
    href: string;
    label: string;
    icon: typeof Clapperboard;
    mode: DiscoveryMode;
    active: boolean;
  }[] = user?.role === "provider"
    ? [
        {
          href: "/services",
          label: "Services",
          icon: Wrench,
          mode: "services",
          active: pathname.startsWith("/services") || pathname.startsWith("/providers"),
        },
      ]
    : user?.role === "recruiter"
      ? [
          {
            href: "/recruiter/find-talent",
            label: "Talent",
            icon: UsersRound,
            mode: "talent",
            active:
              pathname.startsWith("/recruiter/find-talent") ||
              pathname === "/discover",
          },
          {
            href: "/services",
            label: "Services",
            icon: Wrench,
            mode: "services",
            active:
              pathname.startsWith("/services") ||
              pathname.startsWith("/providers") ||
              pathname === "/discover",
          },
        ]
      : [
          {
            href: "/talent/opportunities",
            label: "Opportunities",
            icon: Clapperboard,
            mode: "opportunities",
            active:
              (isOpportunities && !isRecruiters && !isServices) ||
              (pathname === "/discover" && (!user || user.role === "talent")),
          },
          {
            href: "/talent/opportunities?view=recruiters",
            label: "Recruiters",
            icon: UsersRound,
            mode: "recruiters",
            active: isRecruiters,
          },
          {
            href: isTalentDiscovery ? "/talent/opportunities?view=services" : "/services",
            label: "Services",
            icon: Wrench,
            mode: "services",
            active: isTalentDiscovery
              ? isServices
              : pathname.startsWith("/services") ||
                pathname.startsWith("/providers"),
          },
        ];

  return (
    <nav
      aria-label="Discovery options"
      className={cn(
        "grid gap-1.5 rounded-2xl border border-border/70 bg-card p-1.5 shadow-sm",
        tabs.length === 1 ? "grid-cols-1" : tabs.length === 2 ? "grid-cols-2" : "grid-cols-3",
      )}
    >
      {tabs.map(({ href, label, icon: Icon, mode: tabMode, active }) => {
        const selected = mode ? mode === tabMode : active;
        const displayLabel =
          (onModeChange || isTalentDiscovery) && tabMode === "recruiters"
            ? "Companies"
            : (onModeChange || isTalentDiscovery) && tabMode === "services"
              ? "Marketplace"
              : label;
        const className = cn(
          "flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-center text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-3 sm:text-sm",
          selected
            ? onModeChange || isTalentDiscovery
              ? "bg-gradient-to-r from-[#9d1fe8] to-[#7212c7] text-white shadow-[0_4px_12px_rgba(126,19,205,0.28)]"
              : "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        );

        return onModeChange ? (
          <button
            key={tabMode}
            type="button"
            aria-pressed={selected}
            className={className}
            onClick={() => onModeChange(tabMode)}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {displayLabel}
          </button>
        ) : (
          <Link
            key={tabMode}
            href={addSearch(href)}
            aria-current={selected ? "page" : undefined}
            className={className}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {displayLabel}
          </Link>
        );
      })}
    </nav>
  );
}
