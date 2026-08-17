"use client";

import { useState } from "react";
import { Home, MessageSquare, Search, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNav = [
  { label: "Home", icon: Home },
  { label: "Search", icon: Search },
  { label: "Messages", icon: MessageSquare, badge: 8 },
  { label: "Shortlists", icon: Star },
  { label: "Profile", icon: User },
];

export function MobileBottomNav() {
  const [active, setActive] = useState("Search");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg-surface/95 backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-center justify-between px-6 py-2">
        {bottomNav.map((item) => (
          <li key={item.label}>
            <button
              onClick={() => setActive(item.label)}
              className={cn(
                "relative flex w-16 flex-col items-center gap-1 py-1 text-[11px] transition-all duration-200",
                 active === item.label ? "text-accent" : "text-muted-foreground/70",
              )}
            >
              <item.icon width={20} height={20} />
              {item.badge ? (
                <span
                  className="absolute -top-0.5 right-2 grid h-4 min-w-4 place-items-center rounded-full bg-badge-red px-1 text-[10px] font-bold text-white shadow-[0_0_8px_-3px_var(--badge-red)]"
                  style={{ animation: "badge-float 3s ease-in-out infinite" }}
                >
                  {item.badge}
                </span>
              ) : null}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
