"use client";

import { cn } from "@/lib/utils";

type CategoryFilter = "all" | "work" | "personal" | "intro";

interface PortfolioCategoryFilterProps {
  active: CategoryFilter;
  onChange: (category: CategoryFilter) => void;
  counts: { work: number; personal: number; intro: number };
}

export function PortfolioCategoryFilter({
  active,
  onChange,
  counts,
}: PortfolioCategoryFilterProps) {
  const categories: { key: CategoryFilter; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "work", label: "Work", count: counts.work },
    { key: "personal", label: "Personal", count: counts.personal },
    { key: "intro", label: "Intro", count: counts.intro },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border",
            active === cat.key
              ? cat.key === "intro"
                ? "bg-brand-soft text-ink-warm border-brand/30"
                : "bg-foreground text-background border-foreground"
              : "bg-card text-text-secondary border-border hover:bg-muted"
          )}
        >
          {cat.label}
          {cat.count !== undefined && cat.key !== "all" && (
            <span
              className={cn(
                "text-[10px] tabular-nums",
                active === cat.key ? "opacity-60" : "text-text-muted"
              )}
            >
              {cat.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
