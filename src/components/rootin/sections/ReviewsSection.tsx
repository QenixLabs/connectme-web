"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, SectionHead, Stars, EmptyState } from "../primitives";
import { getDisplayMode } from "./types";
import type { ReviewItem } from "./types";

export interface ReviewsSectionProps {
  data: ReviewItem[];
  columns?: 1 | 2;
  className?: string;
}

export function ReviewsSection({ data, columns = 2, className }: ReviewsSectionProps) {
  const mode = getDisplayMode(data.length);

  return (
    <Card className={cn("transition-all duration-300 ease-out", className)}>
      <SectionHead
        icon={<Star width={16} height={16} />}
        title="Reviews"
        action="View All"
      />

      {mode === "empty" ? (
        <EmptyState icon={<Star width={32} height={32} />} message="No reviews yet." />
      ) : (
        <div
          className={cn(
            "transition-all duration-300 ease-out",
            mode === "expanded" && "overflow-auto",
          )}
          style={mode === "expanded" ? { maxHeight: "min(480px, 60vh)" } : undefined}
        >
          <div
            className={cn(
              "grid gap-4 transition-all duration-300 ease-out",
              columns === 2 && mode !== "compact" && "md:grid-cols-2",
            )}
          >
            {data.map((r) => (
              <article
                key={r.name}
                className="rounded-xl border bg-surface p-4 transition-all duration-200 hover:-translate-y-px hover:bg-surface/90"
                style={{ borderColor: "var(--border-card)" }}
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    loading="lazy"
                    width={512}
                    height={512}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground/85">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground/50">{r.role}</p>
                  </div>
                  <p className="shrink-0 text-[10px] text-muted-foreground/40">{r.when}</p>
                </div>
                <div className="mt-2">
                  <Stars value={r.rating} />
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-foreground/70">{r.quote}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
