"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChecklistRow } from "./_checklist-row";

const DEFAULT_TIPS = [
  "Complete and update your media kit",
  "Maintain timely and professional responses",
  "Deliver consistent, high-quality work",
];

export function TipsCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-[17px] font-medium text-ink mb-2">
          Tips to Improve Trust Score
        </h2>
        <ul>
          {DEFAULT_TIPS.map((tip) => (
            <ChecklistRow key={tip} label={tip} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
