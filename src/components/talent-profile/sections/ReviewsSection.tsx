"use client";

import { useState } from "react";
import { Quote, Star } from "lucide-react";
import { CollapsibleSection, Stars } from "../primitives";
import type { ReviewItem } from "../data";

const MAX_VISIBLE = 2;

function ReviewCard({ review }: { review: ReviewItem }) {
  const initials =
    review.name
      ?.split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <li className="flex gap-2">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-[8px] font-bold text-brand">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="truncate text-[11px] font-bold text-foreground">
            {review.name}
          </p>
          <span className="flex shrink-0 gap-0.5">
            <Stars value={review.rating} size={10} />
          </span>
        </div>
        {review.role && (
          <p className="text-[10px] text-muted-foreground">{review.role}</p>
        )}
        {review.quote && (
          <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
            &ldquo;{review.quote}&rdquo;
          </p>
        )}
      </div>
    </li>
  );
}

export function ReviewsSection({
  data,
  initialShowAll = false,
  collapsible = false,
}: {
  data: ReviewItem[];
  initialShowAll?: boolean;
  collapsible?: boolean;
}) {
  const [showAll, setShowAll] = useState(initialShowAll);
  const hasMore = data.length > MAX_VISIBLE;
  const visible = showAll || !hasMore ? data : data.slice(0, MAX_VISIBLE);

  return (
    <CollapsibleSection
      icon={<Quote className="size-4" />}
      title="What People Say"
      action={
        hasMore ? (showAll ? "Show Less" : "View All") : undefined
      }
      onAction={hasMore ? () => setShowAll((v) => !v) : undefined}
      collapsible={collapsible && data.length > 0}
    >
      {data.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground/60">
          No reviews yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
      )}
    </CollapsibleSection>
  );
}
