"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { useFilterSheetOpen } from "@/hooks/use-filter-sheet";
import type { NavItem } from "./nav-config";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface BottomBarProps {
  navItems: NavItem[];
  iconOnly?: boolean;
  variant?: "default" | "settings";
}

export function BottomBar({ navItems, iconOnly, variant = "default" }: BottomBarProps) {
  const pathname = usePathname();
  const isSettingsVariant = variant === "settings";
  const isMounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const filterSheetOpen = useFilterSheetOpen();

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 z-50 w-full pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden",
      isSettingsVariant
        ? "border-t border-[#e6e1f5] bg-white/95 shadow-[0_-8px_30px_rgba(75,44,160,0.12)]"
        : "border-t border-border bg-bg-surface/95",
      filterSheetOpen && "hidden"
    )}>
      <div className={cn(
        "grid auto-cols-fr grid-flow-col",
        isSettingsVariant ? "h-[78px]" : "h-16",
      )}>
        {navItems.map((item) => {
          const active = isMounted && (
            pathname.startsWith(item.href) ||
            (isSettingsVariant && item.label === "Profile")
          );
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-0.5 py-2 transition-colors",
                isSettingsVariant
                  ? active ? "text-[#6f2ce9]" : "text-[#29265f] hover:text-[#6f2ce9]"
                  : active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
            >
              <span
                className={cn(
                  isSettingsVariant
                    ? "flex h-12 min-w-[58px] items-center justify-center rounded-[18px] transition-all duration-200"
                    : "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                  active
                    ? isSettingsVariant
                      ? "bg-[#f0e8ff] text-[#6f2ce9]"
                      : "bg-primary/15 text-primary"
                    : isSettingsVariant ? "group-hover:bg-[#f7f3ff]" : "group-hover:bg-surface"
                )}
              >
                <Icon className={isSettingsVariant ? "size-6" : "size-5"} />
              </span>
              {(!iconOnly || isSettingsVariant) && (
                <span className={cn(
                  "text-[10px] font-medium",
                  isSettingsVariant && "text-[12px]"
                )}>{item.label}</span>
              )}
              {active && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
