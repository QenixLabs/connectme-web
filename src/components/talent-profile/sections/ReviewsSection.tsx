"use client";

import { Star } from "lucide-react";
import { GlassCard, SectionHeader, Stars } from "../primitives";
import type { ReviewItem } from "../data";

export function ReviewsSection({ data }: { data: ReviewItem[] }) {
  return (
    <GlassCard>
      <SectionHeader icon={<Star className="size-4" />} title="Reviews" />
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground/60">
          No reviews yet.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((review) => (
            <article
              key={review.id}
              className="profile-inset rounded-xl p-4 transition-all duration-200 hover:border-border-hover"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground/90">{review.name}</p>
                  <p className="text-xs text-muted-foreground/55">{review.role}</p>
                </div>
                <p className="shrink-0 text-[10px] text-muted-foreground/40">{review.when}</p>
              </div>
              <div className="mt-2">
                <Stars value={review.rating} size={14} />
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-foreground/70">
                &ldquo;{review.quote}&rdquo;
              </p>
            </article>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
