"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Achievement } from "@/lib/api/talent";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/hooks/use-portfolio";
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
  const youtubeThumbnail = media ? getYouTubeThumbnail(media) : null;

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
          src={youtubeThumbnail ?? media}
          alt=""
          loading="lazy"
          className="relative z-10 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
      {youtubeThumbnail && (
        <span className="absolute inset-0 z-20 grid place-items-center text-white">
          <span className="grid size-8 place-items-center rounded-full bg-black/65">
            <span className="ml-0.5 size-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-white" />
          </span>
        </span>
      )}
    </div>
  );
}

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const [open, setOpen] = useState(false);
  const config = ACHIEVEMENT_TYPE_CONFIG[achievement.type];
  const Icon = config.icon;
  const role = getAchievementRole(achievement);
  const year = getAchievementYear(achievement);
  const media = getAchievementMedia(achievement);
  const youtubeUrl = media ? getYouTubeEmbedUrl(media) : null;
  const isVideo = Boolean(media && /\.(?:mp4|webm|mov)(?:[?#].*)?$/i.test(media));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${getAchievementTitle(achievement)} details`}
        className="flex h-[112px] w-[calc((100vw-3.75rem)/2.2)] min-w-[154px] max-w-[238px] shrink-0 gap-2 rounded-[18px] border border-[#e8e7f4] bg-white p-2 text-left shadow-[0_7px_20px_rgba(36,43,93,0.07)] transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6846d9]/40 sm:h-[124px] sm:w-[235px] sm:p-2.5"
      >
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
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] max-w-xl overflow-y-auto rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-left">{getAchievementTitle(achievement)}</DialogTitle>
          </DialogHeader>
          {media && !isPdf(media) && (
            <div className="overflow-hidden rounded-xl bg-black">
              {youtubeUrl ? (
                <iframe
                  src={`${youtubeUrl}?autoplay=1&rel=0`}
                  title={`${getAchievementTitle(achievement)} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full"
                />
              ) : isVideo ? (
                <video src={media} controls className="max-h-[60svh] w-full" />
              ) : (
                <img
                  src={media}
                  alt={getAchievementTitle(achievement)}
                  className="max-h-[60svh] w-full object-contain"
                />
              )}
            </div>
          )}
          {media && isPdf(media) && (
            <a
              href={media}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#5e34d7] underline"
            >
              View proof document
            </a>
          )}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#14225b]">{getAchievementOrganization(achievement)}</p>
            {(role || year) && (
              <p className="text-xs text-[#777993]">{[role, year].filter(Boolean).join(" · ")}</p>
            )}
            {achievement.description && (
              <p className="whitespace-pre-wrap pt-2 text-sm leading-relaxed text-[#555b77]">{achievement.description}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
