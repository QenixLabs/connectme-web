"use client";

import type { ComponentType } from "react";

export type TabId = "overview" | "looks" | "skills" | "links";

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

interface SegmentedTabsProps {
  tabs: { id: TabId; label: string; icon: ComponentType<{ className?: string }> }[];
  value: TabId;
  onChange: (id: TabId) => void;
}

export function SegmentedTabs({ tabs, value, onChange }: SegmentedTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <div className="sticky top-[57px] z-20 px-4 mt-4 pb-1 pt-1 bg-background/80 backdrop-blur-xl">
      <div className={`relative rounded-2xl bg-cream-deep/70 border border-border/60 p-1 grid ${GRID_COLS[tabs.length] || "grid-cols-4"}`}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`relative z-10 h-11 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-medium transition-colors ${
                active ? "text-ink shadow-sm bg-card" : "text-ink-muted"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-gold" : "text-ink-muted"}`} />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
