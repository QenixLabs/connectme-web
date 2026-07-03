"use client";

import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_TIPS = [
  "Complete and update your media kit",
  "Maintain timely and professional responses",
  "Deliver consistent, high-quality work",
];

export function TipsCard() {
  return (
    <Card className="border-[#e0d9ce] shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-[#1e1a14] uppercase tracking-[0.02em]">
            Tips to Improve
          </h2>
        </div>
        <div className="space-y-0">
          {DEFAULT_TIPS.map((tip, i) => (
            <div
              key={tip}
              className="flex items-start gap-2.5 py-1.5 text-[13px] text-[#3d3529] leading-relaxed"
              style={{ borderBottom: i === DEFAULT_TIPS.length - 1 ? undefined : "0.5px solid #f0ebe2" }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0"
                style={{
                  background: "#f5f3ef",
                  border: "0.5px solid #ddd5c5",
                }}
              >
                <span className="text-[10px] font-bold text-[#8a7d6b]">{i + 1}</span>
              </div>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
