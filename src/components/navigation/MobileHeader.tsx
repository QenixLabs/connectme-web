"use client";

import { Bell, BriefcaseBusiness, Menu, MessageSquare } from "lucide-react";

function MiniBadge({
  icon: Icon,
  count,
  tone,
  label,
}: {
  icon: typeof Bell;
  count: number;
  tone: "primary" | "warning" | "accent";
  label: string;
}) {
  const toneClass =
    tone === "warning"
      ? "bg-warning text-warning-foreground"
      : tone === "accent"
        ? "bg-accent text-accent-foreground"
        : "bg-primary text-primary-foreground";
  return (
    <button
      aria-label={label}
      className="relative grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground"
    >
      <Icon className="size-4" strokeWidth={1.75} />
      <span
        className={`absolute -right-1 -top-1 grid size-4 place-items-center rounded-full text-[10px] font-semibold ${toneClass}`}
      >
        {count}
      </span>
    </button>
  );
}

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 -mx-4 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
      <button aria-label="Open menu" className="grid size-9 place-items-center text-foreground">
        <Menu className="size-5" />
      </button>
      <span className="truncate font-display text-xl font-bold tracking-tight text-foreground">RootIn</span>
      <div className="flex shrink-0 items-center gap-2">
        <MiniBadge icon={MessageSquare} count={6} tone="primary" label="Messages" />
        <MiniBadge icon={Bell} count={12} tone="warning" label="Notifications" />
        <MiniBadge icon={BriefcaseBusiness} count={8} tone="accent" label="Projects" />
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-foreground">
          RV
        </span>
      </div>
    </header>
  );
}
