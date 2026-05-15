"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_TIPS = [
  "Complete and update media kit",
  "Maintain timely and professional responses",
  "Deliver consistent, high-quality work",
];

export function TipsCard() {
  return (
    <Card className="border-t-[2px] border-t-brand-muted overflow-hidden">
      <div className="px-3.5 sm:px-4 pt-3 pb-2">
        <h2 className="text-[11px] uppercase tracking-[0.08em] font-medium text-brand-hover">Tips to Improve Trust Score</h2>
      </div>
      <CardContent className="px-3.5 sm:px-4 pb-3.5 pt-0 space-y-1.5">
        {DEFAULT_TIPS.map((tip) => (
          <div key={tip} className="flex items-start gap-2">
            <Star className="w-3.5 h-3.5 text-brand mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[12px] text-text-primary">{tip}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
