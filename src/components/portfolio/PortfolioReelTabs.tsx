"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { PortfolioTab } from "@/lib/types/portfolio";

interface PortfolioReelTabsProps {
  username: string;
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

export function PortfolioReelTabs({
  username,
  activeTab,
  onChange,
  counts,
}: PortfolioReelTabsProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-40 flex h-[52px] items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur">
      <button
        onClick={() => router.push(`/talent/${username}`)}
        className="grid size-9 place-items-center rounded-full text-foreground hover:bg-muted"
        aria-label="Back to profile"
      >
        <ArrowLeft className="size-5" />
      </button>

      <div className="flex flex-1 justify-center gap-1 overflow-x-auto [scrollbar-width:none]">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={`relative shrink-0 px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {tab}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {counts[tab]}
                </span>
              </span>
              {isActive && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      <div className="w-9" />
    </div>
  );
}
