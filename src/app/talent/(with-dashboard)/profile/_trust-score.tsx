"use client";

import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ChecklistRow } from "./_checklist-row";

interface TrustScoreProps {
  completeness?: number;
}

const DEFAULT_ITEMS = [
  "Responded promptly to inquiries",
  "Highly rated collaborations",
  "Positive brand feedback",
];

function completenessLabel(pct?: number) {
  if (pct === undefined) return "Starter";
  if (pct >= 80) return "Excellent";
  if (pct >= 60) return "Advanced";
  if (pct >= 40) return "Intermediate";
  if (pct >= 20) return "Beginner";
  return "Starter";
}

export function TrustScore({ completeness }: TrustScoreProps) {
  const label = completenessLabel(completeness);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[17px] font-medium text-ink">Trust Score</h2>
          <span className="inline-flex items-center gap-0.5 text-[14px] font-medium text-gold">
            {label}
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </span>
        </div>
        <ul>
          {DEFAULT_ITEMS.map((item) => (
            <ChecklistRow key={item} label={item} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
