"use client";

import { useState } from "react";
import {
  BarChart3,
  Briefcase,
  Calendar,
  CreditCard,
  Crown,
  FileText,
  Home,
  MessageSquare,
  Search,
  Settings,
  Star,
  Users,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", icon: Home },
  { label: "Talent Search", icon: Search },
  { label: "Projects", icon: Briefcase },
  { label: "Applications", icon: FileText },
  { label: "Shortlists", icon: Star },
  { label: "Messages", icon: MessageSquare, badge: 8 },
  { label: "Interviews", icon: Calendar },
  { label: "Payments", icon: CreditCard },
  { label: "Analytics", icon: BarChart3 },
  { label: "Team Builder", icon: Users },
  { label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <aside
      className="fixed inset-y-0 left-0 z-20 hidden w-[220px] flex-col border-r bg-sidebar lg:flex"
      style={{ borderColor: "oklch(1 0 0 / 0.04)" }}
    >
      <div className="px-6 py-6">
        <p className="font-display text-[28px] font-semibold tracking-tight">RootIn</p>
        <p className="mt-1.5 text-xs text-muted-foreground/40">
          Talent. Opportunities. Growth.
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3.5">
        <ul className="space-y-0.5">
          {nav.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => setActive(item.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  active === item.label
                    ? "bg-primary/20 font-medium text-foreground"
                    : "text-muted-foreground/55 hover:bg-sidebar-accent/40 hover:text-foreground/70",
                )}
              >
                <item.icon width={18} height={18} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                {item.badge ? (
                  <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground shadow-[0_0_8px_-3px_var(--accent)]">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div
        className="mx-3 mb-4 mt-auto rounded-xl border border-gold/10 p-3.5"
        style={{
          backgroundImage:
            "linear-gradient(180deg, oklch(0.22 0.03 85 / 0.08) 0%, oklch(0.18 0.02 80 / 0.03) 100%)",
        }}
      >
        <Crown width={18} height={18} className="text-gold" />
        <p className="mt-2 font-display text-base tracking-tight">Go Premium</p>
        <p className="mt-1 text-[11px] leading-relaxed text-foreground/45">
          Unlock unlimited searches, advanced filters, and exclusive insights.
        </p>
        <button className="mt-3 flex items-center gap-1 text-[13px] font-medium text-accent/70 transition-colors duration-200 hover:text-accent">
          Upgrade Now <ArrowRight width={14} height={14} />
        </button>
      </div>
    </aside>
  );
}
