"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Testimonial } from "@/lib/validations/credit-testimonial.schema";

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface ReviewsSectionProps {
  reviews: Testimonial[];
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
        {reviews.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            No reviews yet
          </p>
        ) : (
        reviews.map((r) => (
          <div
            key={r._id}
            className="rounded-xl border border-border bg-background/60 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {getInitials(r.author_name)}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {r.author_name}
                </div>
                <div className="text-xs text-muted-foreground">{r.author_role}</div>
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
            <div className="mt-3 text-xs text-muted-foreground">{formatDate(r.created_at)}</div>
          </div>
        ))
        )}
      </div>
    </Card>
  );
}
