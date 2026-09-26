"use client";

/* eslint-disable @next/next/no-img-element */

import { FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Achievement } from "@/lib/api/talent";
import {
  ACHIEVEMENT_TYPE_CONFIG,
  getAchievementMedia,
  getAchievementOrganization,
  getAchievementRole,
  getAchievementTitle,
  getAchievementYear,
  isVerifiedAchievement,
} from "./achievement-types";

function isPdf(url: string) {
  return /\.pdf(?:[?#].*)?$/i.test(url);
}

export function AchievementMedia({
  achievement,
  className = "",
}: {
  achievement: Achievement;
  className?: string;
}) {
  const ConfigIcon = ACHIEVEMENT_TYPE_CONFIG[achievement.type].icon;
  const media = getAchievementMedia(achievement);

  return (
    <div className={`relative isolate overflow-hidden bg-[#f1effb] ${className}`}>
      <span className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_25%_20%,rgba(124,58,237,0.2),transparent_62%),linear-gradient(145deg,#f5f3ff,#e9efff)] text-[#6543d8]">
        {media && isPdf(media) ? (
          <FileCheck2 className="size-7" strokeWidth={1.8} />
        ) : (
          <ConfigIcon className="size-7" strokeWidth={1.8} />
        )}
      </span>
      {media && !isPdf(media) && (
        <img
          src={media}
          alt=""
          loading="lazy"
          className="relative z-10 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const config = ACHIEVEMENT_TYPE_CONFIG[achievement.type];
  const Icon = config.icon;
  const role = getAchievementRole(achievement);
  const year = getAchievementYear(achievement);

  return (
    <article className="flex h-[112px] w-[calc((100vw-3.75rem)/2.2)] min-w-[154px] max-w-[238px] shrink-0 gap-2 rounded-[18px] border border-[#e8e7f4] bg-white p-2 shadow-[0_7px_20px_rgba(36,43,93,0.07)] sm:h-[124px] sm:w-[235px] sm:p-2.5">
      <AchievementMedia
        achievement={achievement}
        className="size-[68px] shrink-0 rounded-[13px] sm:size-[78px]"
      />
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start gap-1">
          {achievement.featured && (
            <Badge className="mb-1 h-4 shrink-0 rounded-full bg-[#fff0bd] px-1.5 text-[8px] font-extrabold text-[#a16207] hover:bg-[#fff0bd]">
              Featured
            </Badge>
          )}
          {isVerifiedAchievement(achievement) && (
            <span className="mt-0.5 shrink-0 text-[#6d3ce8]" title="Verified achievement">
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-[11px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#14225b] sm:text-xs">
          {getAchievementTitle(achievement)}
        </h3>
        <p className="mt-1 line-clamp-2 text-[10px] leading-[1.15] text-[#646b91]">
          {getAchievementOrganization(achievement)}
        </p>
        {(role || year) && (
          <p className="mt-1 line-clamp-1 text-[9px] font-semibold text-[#8a8da8]">
            {[role, year].filter(Boolean).join("  |  ")}
          </p>
        )}
      </div>
    </article>
  );
}
