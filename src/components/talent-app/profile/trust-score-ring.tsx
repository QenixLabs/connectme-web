"use client";

import { cn } from "@/lib/utils";

interface TrustScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
  className?: string;
}

export function TrustScoreRing({
  score,
  size = 56,
  stroke = 5,
  className,
}: TrustScoreRingProps) {
  const normalized = Math.min(100, Math.max(0, score));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  let color = "text-destructive";
  if (normalized >= 80) color = "text-success";
  else if (normalized >= 50) color = "text-warning";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-label={`Trust score ${normalized}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="text-muted/30"
          strokeWidth={stroke}
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn("transition-all duration-700", color)}
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[11px] font-bold">{normalized}</span>
    </div>
  );
}
