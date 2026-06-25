"use client";

import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_TIPS = [
  "Complete and update your media kit",
  "Maintain timely and professional responses",
  "Deliver consistent, high-quality work",
];

export function TipsCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-[13px] font-semibold text-ink uppercase tracking-[0.02em] mb-3">
          Tips to Improve
        </h2>
        <div className="divide-y divide-border">
          {DEFAULT_TIPS.map((tip, i) => (
            <div key={tip} className="flex items-start gap-2.5 py-1.5 text-[13px] text-ink-warm leading-relaxed first:pt-0 last:pb-0">
              <div className="w-5 h-5 rounded-full bg-cream border border-border grid place-items-center shrink-0 mt-0">
                <span className="text-[10px] font-bold text-ink-muted">{i + 1}</span>
              </div>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
