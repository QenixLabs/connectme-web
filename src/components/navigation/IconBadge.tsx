"use client";

import type { LucideIcon } from "lucide-react";

type Tone = "primary" | "warning" | "accent";

const toneClass: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground",
  warning: "bg-warning text-warning-foreground",
  accent: "bg-accent text-accent-foreground",
};

export function IconBadge({
  icon: Icon,
  count,
  tone = "primary",
  label,
}: {
  icon: LucideIcon;
  count: number;
  tone?: Tone;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="relative grid h-10 w-10 place-items-center rounded-xl border bg-card text-accent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--glow-accent)]"
      style={{ borderColor: "var(--border-card)" }}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span
        className={`absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold shadow-[0_0_8px_-3px_var(--accent)] ${toneClass[tone]}`}
        style={{ animation: "badge-float 3s ease-in-out infinite" }}
      >
        {count}
      </span>
    </button>
  );
}
