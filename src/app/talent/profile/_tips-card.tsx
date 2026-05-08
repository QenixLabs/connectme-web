"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_TIPS = [
  "Complete and update media kit",
  "Maintain timely and professional responses",
  "Deliver consistent, high-quality work",
];

export function TipsCard() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-sm sm:text-base font-semibold text-text-primary mb-4">
          Tips to Improve Trust Score
        </h2>

        <div className="space-y-3">
          {DEFAULT_TIPS.map((tip) => (
            <div key={tip} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-xs sm:text-sm text-text-secondary">{tip}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
