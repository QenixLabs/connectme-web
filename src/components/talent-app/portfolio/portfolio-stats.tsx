"use client";

import {
  Image as ImageIcon,
  Eye,
  Layers,
  Video,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconBg: Record<string, string> = {
  teal: "bg-teal/15 text-teal",
  green: "bg-green/20 text-green",
  purple: "bg-purple/25 text-purple",
  orange: "bg-orange/20 text-orange",
  blue: "bg-blue/20 text-blue",
};

export function PortfolioStats({
  totalItems,
  imagesUsed,
  videosUsed,
  linksCount,
  totalViews,
}: {
  totalItems: number;
  imagesUsed: number;
  videosUsed: number;
  linksCount: number;
  totalViews: number;
}) {
  const stats = [
    { value: String(totalItems), label: "Items", icon: Layers, color: "teal" },
    { value: String(imagesUsed), label: "Images", icon: ImageIcon, color: "green" },
    { value: String(videosUsed), label: "Videos", icon: Video, color: "purple" },
    { value: String(linksCount), label: "Links", icon: Link2, color: "orange" },
    { value: String(totalViews), label: "Views", icon: Eye, color: "blue" },
  ] as const;

  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex min-w-[120px] snap-start items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 shadow-card"
        >
          <div
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
              iconBg[s.color],
            )}
          >
            <s.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight">{s.value}</p>
            <p className="truncate text-xs text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
