"use client";

import type { PortfolioTab } from "@/lib/types/portfolio";

interface PortfolioTabsProps {
  activeTab: PortfolioTab;
  onChange: (tab: PortfolioTab) => void;
  counts: {
    All: number;
    Images: number;
    Videos: number;
    YouTube: number;
  };
}

const tabs: PortfolioTab[] = ["All", "Images", "Videos", "YouTube"];

export function PortfolioTabs({ activeTab, onChange, counts }: PortfolioTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={
              "relative shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all active:scale-95 " +
              (isActive
                ? "border-primary/40 bg-primary/15 text-primary"
                 : "profile-inset text-muted-foreground hover:border-border-hover hover:bg-bg-surface hover:text-foreground")
            }
          >
            <span className="flex items-center gap-2">
              {tab}
              <span
                className={
                  "rounded-full px-1.5 py-0.5 text-[10px] " +
                  (isActive
                    ? "bg-primary/20 text-primary"
                     : "bg-muted text-muted-foreground")
                }
              >
                {counts[tab]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
