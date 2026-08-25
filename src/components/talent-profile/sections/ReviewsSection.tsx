"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GlassCard, SectionHeader, Stars } from "../primitives";
import { cn } from "@/lib/utils";
import type { ReviewItem } from "../data";

const MAX_VISIBLE = 2;

const avatarTones = [
  "bg-rootin/10 text-rootin",
  "bg-accent-green-bg text-accent-green",
  "bg-accent-amber-bg text-accent-amber",
];

function ReviewCard({ review, index }: { review: ReviewItem; index: number }) {
  const initials =
    review.name
      ?.split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <article className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-9 border border-border">
            <AvatarFallback
              className={cn(
                "text-xs font-semibold",
                avatarTones[index % avatarTones.length],
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground/90">
              {review.name}
            </p>
            {review.role && (
              <p className="truncate text-[11px] text-muted-foreground/60">
                {review.role}
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 pt-1 text-[10px] text-muted-foreground/40">
          {review.when}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <Stars value={review.rating} size={13} />
        <span className="text-[11px] font-semibold text-gold">
          {review.rating.toFixed(1)}
        </span>
      </div>

      {review.quote && (
        <p className="mt-2 text-sm leading-relaxed text-foreground/75">
          &ldquo;{review.quote}&rdquo;
        </p>
      )}
    </article>
  );
}

export function ReviewsSection({
  data,
  initialShowAll = false,
}: {
  data: ReviewItem[];
  initialShowAll?: boolean;
}) {
  const [showAll, setShowAll] = useState(initialShowAll);
  const hasMore = data.length > MAX_VISIBLE;
  const visible = showAll || !hasMore ? data : data.slice(0, MAX_VISIBLE);

  return (
    <GlassCard>
      <SectionHeader
        icon={<Star className="size-4" />}
        title="Reviews"
        action={
          hasMore ? (showAll ? "Show Less" : "View All") : undefined
        }
        onAction={hasMore ? () => setShowAll((v) => !v) : undefined}
      />
      {data.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground/60">
          No reviews yet.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {visible.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>
      )}
    </GlassCard>
  );
}
