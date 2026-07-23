"use client";

import { Card } from "@/components/ui/card";
import { Star, ChevronRight } from "lucide-react";

const MOCK_RATINGS = [
  { star: 5, pct: 85 },
  { star: 4, pct: 10 },
  { star: 3, pct: 3 },
  { star: 2, pct: 1 },
  { star: 1, pct: 1 },
];

export function RecruiterReviewsCard() {
  return (
    <Card className="border-border p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">Reviews & Ratings</h2>
        <button className="flex items-center gap-1 text-sm font-semibold text-amber hover:underline">
          View All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-5xl font-bold">4.8</div>
        <div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-4 w-4 fill-amber text-amber" />
            ))}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">(124 Reviews)</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {MOCK_RATINGS.map((r) => (
          <div key={r.star} className="flex items-center gap-2 text-xs">
            <span className="flex w-6 items-center gap-0.5 font-semibold">
              {r.star}
              <Star className="h-3 w-3 fill-amber text-amber" />
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber"
                style={{ width: `${r.pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-muted-foreground">{r.pct}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
