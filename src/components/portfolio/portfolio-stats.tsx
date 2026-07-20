"use client";

import { Image as ImageIcon, Film, Eye, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioStatsProps {
  totalItems: number;
  imagesCount: number;
  videosCount: number;
  totalViews: number;
  profileViews7d: number;
}

function StatPill({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  value: number;
  label: string;
  accent?: "gold" | "blue" | "green" | "default";
}) {
  const accentStyles = {
    gold: "bg-cream-soft text-ink-warm border-border-warm",
    blue: "bg-blue-light text-blue border-blue-100",
    green: "bg-success-light text-success border-success-soft",
    default: "bg-muted text-text-secondary border-border",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3.5 py-3",
        accentStyles[accent ?? "default"]
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="text-base font-semibold tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] opacity-70 leading-tight">{label}</p>
      </div>
    </div>
  );
}

export function PortfolioStats({
  totalItems,
  imagesCount,
  videosCount,
  totalViews,
  profileViews7d,
}: PortfolioStatsProps) {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
      <StatPill icon={FolderOpen} value={totalItems} label="Items" accent="gold" />
      <StatPill icon={ImageIcon} value={imagesCount} label="Images" accent="blue" />
      {videosCount > 0 && (
        <StatPill icon={Film} value={videosCount} label="Videos" accent="gold" />
      )}
      <StatPill icon={Eye} value={totalViews + profileViews7d} label="Views" accent="green" />
    </div>
  );
}
