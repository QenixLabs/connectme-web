"use client";

import { Trophy, Star, Award } from "lucide-react";
import type { ComponentType } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Award as AwardType } from "@/lib/validations/credit-testimonial.schema";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  star: Star,
  award: Award,
};

interface AwardsSectionProps {
  awards: AwardType[];
}

export function AwardsSection({ awards }: AwardsSectionProps) {
  if (awards.length === 0) return null;

  return (
    <Card className="border-border shadow-card">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Awards & Recognitions
          </h2>
          {awards.length > 3 && (
            <button className="text-sm font-semibold text-amber hover:underline">
              View All
            </button>
          )}
        </div>

        <ul className="space-y-3">
          {awards.map((award) => {
            const Icon = Award;
            return (
              <li key={award._id} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber/15">
                  <Icon className="h-4 w-4 text-amber" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    {award.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {award.awarding_body}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
