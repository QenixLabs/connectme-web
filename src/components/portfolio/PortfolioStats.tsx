"use client";

import { Heart, Eye } from "lucide-react";
import { formatCount } from "@/hooks/use-portfolio";

interface PortfolioStatsProps {
  likesCount: number;
  viewsCount: number;
  liked?: boolean;
  className?: string;
}

export function PortfolioStats({
  likesCount,
  viewsCount,
  liked,
  className,
}: PortfolioStatsProps) {
  return (
    <div className={`flex items-center gap-4 text-sm ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 ${
          liked ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Heart
          className={`size-4 ${liked ? "fill-current" : ""}`}
          strokeWidth={liked ? 1.5 : 2}
        />
        {formatCount(likesCount)}
      </span>
      {viewsCount > 0 && (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Eye className="size-4" />
          {formatCount(viewsCount)}
        </span>
      )}
    </div>
  );
}
