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
    <div className="mt-5 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] sm:mt-6 sm:gap-2">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`relative shrink-0 px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
              isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {counts[tab]}
              </span>
            </span>
            {isActive && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
