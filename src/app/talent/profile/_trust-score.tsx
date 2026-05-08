"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";
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
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-base font-semibold text-text-primary">Trust Score</h2>
          <button className="flex items-center gap-1 text-xs sm:text-sm text-text-tertiary hover:text-text-secondary transition-colors">
            {label}
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-3">
          {DEFAULT_ITEMS.map((item) => (
            <div key={item} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-xs sm:text-sm text-text-secondary">{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
