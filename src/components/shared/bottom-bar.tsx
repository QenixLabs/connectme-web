"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-config";

interface BottomBarProps {
  navItems: NavItem[];
  iconOnly?: boolean;
}

export function BottomBar({ navItems, iconOnly }: BottomBarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-border bg-background md:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
              {!iconOnly && item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
