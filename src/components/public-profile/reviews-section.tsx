"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MockReview } from "@/lib/mocks/public-profile";

interface ReviewsSectionProps {
  reviews: MockReview[];
  aggregateRating?: number;
  totalCount?: number;
  showWriteReview?: boolean;
}

export function ReviewsSection({
  reviews,
  aggregateRating = 4.8,
  totalCount,
  showWriteReview = false,
}: ReviewsSectionProps) {
  const count = totalCount ?? reviews.length;

  return (
    <Card className="border-border p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground">
            Reviews ({count})
          </h2>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-foreground">
              {aggregateRating}
            </span>
            <div className="flex text-amber">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(aggregateRating) ? "fill-current" : ""
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({count} Reviews)
            </span>
          </div>
        </div>
        {showWriteReview && (
          <Button size="sm" className="rounded-lg bg-primary text-primary-foreground">
            Write a Review
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-border bg-background/60 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {r.initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {r.name}
                </div>
                <div className="text-xs text-muted-foreground">{r.role}</div>
              </div>
            </div>
            <div className="mt-3 flex text-amber">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <p className="mt-2 text-sm text-foreground/90">
              &ldquo;{r.content}&rdquo;
            </p>
            <div className="mt-3 text-xs text-muted-foreground">{r.date}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
