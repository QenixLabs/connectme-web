"use client";

import { ImageIcon, Play, Youtube } from "lucide-react";
import type { PortfolioItemType } from "@/lib/types/portfolio";

interface PortfolioTypeBadgeProps {
  type: PortfolioItemType;
  className?: string;
}

const config: Record<
  PortfolioItemType,
  { icon: React.ReactNode; label: string }
> = {
  image: { icon: <ImageIcon className="size-3.5" />, label: "Image" },
  video: { icon: <Play className="size-3.5 fill-current" />, label: "Video" },
  youtube: { icon: <Youtube className="size-3.5" />, label: "YouTube" },
  instagram: { icon: <ImageIcon className="size-3.5" />, label: "Instagram" },
};

export function PortfolioTypeBadge({ type, className }: PortfolioTypeBadgeProps) {
  const { icon, label } = config[type] ?? config.image;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-black/40 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}
