"use client";

/* eslint-disable @next/next/no-img-element */

import { Clapperboard, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GlassCard } from "../primitives";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { getYouTubeEmbedUrl } from "@/hooks/use-portfolio";

export function ShowreelPlayerCard({
  items,
  username,
  onOpenReel,
}: {
  items: PortfolioItem[];
  username: string;
  onOpenReel?: (itemId: string) => void;
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const hero = items.find((i) => i.profileHighlightType === "showreel");
  if (!hero) return null;

  const img = hero.thumbnailUrl || hero.url;
  const youtubeUrl =
    hero.type === "youtube"
      ? hero.embedUrl || getYouTubeEmbedUrl(hero.url)
      : null;
  const youtubeSrc = youtubeUrl
    ? `${youtubeUrl}${youtubeUrl.includes("?") ? "&" : "?"}rel=0&playsinline=1`
    : null;

  return (
    <GlassCard className="bg-gradient-to-br from-slate-50 to-blue-50/70 p-3.5 sm:p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-purple-100 text-[#7C3AED]">
          <Clapperboard className="size-4" />
         </span>
         <h2 className="text-[15px] font-bold text-foreground">Showreel</h2>
         <Link
           href={`/talent/${encodeURIComponent(username)}/portfolio?type=video`}
           className="ml-auto shrink-0 text-xs font-semibold text-brand transition-colors hover:text-brand/80"
         >
           View All
         </Link>
      </div>
      <div className="relative aspect-video w-full overflow-hidden rounded-[18px] bg-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
        {youtubeSrc ? (
          <iframe
            src={youtubeSrc}
            title={hero.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        ) : hero.type === "video" ? (
          videoFailed ? (
            <div className="grid h-full place-items-center px-6 text-center text-sm text-card">
              <p>
                This video could not be played in your browser.{" "}
                <a href={hero.url} target="_blank" rel="noreferrer" className="underline">
                  Open the video file
                </a>
              </p>
            </div>
          ) : (
            <video
              controls
              playsInline
              preload="metadata"
              poster={hero.thumbnailUrl}
              aria-label={`Play ${hero.title}`}
              className="h-full w-full object-contain"
              onLoadStart={() => setVideoFailed(false)}
              onError={() => setVideoFailed(true)}
              src={hero.url}
            />
          )
        ) : (
          <button
            type="button"
            onClick={() => onOpenReel?.(hero.id)}
            className="group relative block h-full w-full"
          >
            <img src={img} alt={hero.title} loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-12 place-items-center rounded-full border-2 border-card bg-foreground/30 text-card">
                <Play className="size-5 fill-current" />
              </span>
            </span>
          </button>
        )}
        <span className="pointer-events-none absolute bottom-2 left-3 max-w-[60%] truncate rounded-md bg-foreground/60 px-2 py-0.5 text-[11px] font-semibold text-card">
          {hero.title}
        </span>
      </div>
    </GlassCard>
  );
}
