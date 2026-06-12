"use client";

import { Check, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="border-msg-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-msg-ink uppercase tracking-[0.02em]">
            Trust Score
          </h2>
          <button
            className="inline-flex items-center gap-0.5 text-[12px] font-medium text-msg-gold transition-colors"
          >
            {label}
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
        <div className="space-y-0">
          {DEFAULT_ITEMS.map((item, idx) => (
            <div
              key={item}
              className="flex items-center gap-2.5 py-1.5"
              style={{ borderBottom: idx === DEFAULT_ITEMS.length - 1 ? undefined : "0.5px solid var(--color-border-light)" }}
            >
              <div
                className="flex items-center justify-center w-5 h-5 rounded-full bg-msg-gold shrink-0"
              >
                <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[13px] text-ink-warm">{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
