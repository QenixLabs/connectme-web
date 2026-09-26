"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Achievement, AchievementType } from "@/lib/api/talent";
import { ACHIEVEMENT_TYPE_CONFIG } from "./achievement-types";
import { AchievementCard } from "./AchievementCard";

interface AchievementSectionProps {
  type: AchievementType;
  achievements: Achievement[];
}

export function AchievementSection({ type, achievements }: AchievementSectionProps) {
  const [showAll, setShowAll] = useState(false);
  if (achievements.length === 0) return null;

  const config = ACHIEVEMENT_TYPE_CONFIG[type];
  const Icon = config.icon;
  const visible = showAll ? achievements : achievements.slice(0, 3);

  return (
    <section className="space-y-2" aria-labelledby={`achievement-section-${type}`}>
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`grid size-9 shrink-0 place-items-center rounded-[13px] ${config.iconBackground} ${config.iconClass}`}>
            <Icon className="size-[19px]" strokeWidth={2.2} />
          </span>
          <h2 id={`achievement-section-${type}`} className="truncate text-[18px] font-extrabold tracking-[-0.04em] text-[#14225b]">
            {config.pluralLabel}
            <span className="ml-1.5 font-medium text-[#8588a6]">({achievements.length})</span>
          </h2>
        </div>
        {achievements.length > 3 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex min-h-10 shrink-0 items-center gap-0.5 rounded-full px-2 text-[11px] font-bold text-[#5a2fe0] hover:bg-[#f1edff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6846d9]/40"
          >
            {showAll ? "Show Less" : "View All"}
            <ChevronRight className="size-3.5" />
          </Button>
        )}
      </div>
      <Card className="rounded-[22px] border-[#e9e6f7] bg-white/70 shadow-[0_8px_22px_rgba(36,43,93,0.05)]">
        <CardContent className="no-scrollbar flex gap-2.5 overflow-x-auto p-2.5 sm:gap-3 sm:p-3">
          {visible.map((achievement) => (
            <AchievementCard key={achievement._id} achievement={achievement} />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
