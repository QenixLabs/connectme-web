"use client";

import { CircleCheck, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TrustScoreProps {
  score?: "excellent" | "good" | "average" | "poor";
}

const DEFAULT_ITEMS = [
  "Responded promptly to inquiries",
  "Highly rated collaborations",
  "Positive brand feedback",
];

export function TrustScore({ score = "excellent" }: TrustScoreProps) {
  const label = score.charAt(0).toUpperCase() + score.slice(1);

  return (
    <Card className="border-t-[2px] border-t-brand-muted overflow-hidden">
      <div className="flex items-center justify-between px-3.5 sm:px-4 pt-3 pb-2">
        <h2 className="text-[11px] uppercase tracking-[0.08em] font-medium text-brand-hover">Trust Score</h2>
        <button className="inline-flex items-center gap-0.5 text-[12px] text-brand font-medium hover:text-brand-hover transition-colors">
          {label}
          <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
        </button>
      </div>
      <CardContent className="px-3.5 sm:px-4 pb-3.5 pt-0 space-y-1.5">
        {DEFAULT_ITEMS.map((item) => (
          <div key={item} className="flex items-center gap-2">
            <CircleCheck className="w-3.5 h-3.5 text-brand flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[12px] text-text-primary">{item}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
