"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { Share2, Play } from "lucide-react";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { LikeButton } from "./LikeButton";
import { PortfolioActions } from "./PortfolioActions";
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  getYouTubeVideoId,
  formatCount,
} from "@/hooks/use-portfolio";

function buildYouTubeEmbedSrc(baseUrl: string, videoId: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set("autoplay", "1");
  url.searchParams.set("mute", "1");
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("loop", "1");
  url.searchParams.set("playlist", videoId);
  url.searchParams.set("rel", "0");
  url.searchParams.set("controls", "0");
  url.searchParams.set("modestbranding", "1");
  return url.toString();
}

interface PortfolioReelItemProps {
  item: PortfolioItem;
  username: string;
  isActive: boolean;
  isOwner?: boolean;
  onEdit?: (item: PortfolioItem) => void;
  onToggleFeatured?: (item: PortfolioItem) => void;
  onDelete?: (item: PortfolioItem) => void;
  onShare?: (item: PortfolioItem) => void;
}

export function PortfolioReelItem({
  item,
  username,
  isActive,
  isOwner,
  onEdit,
  onToggleFeatured,
  onDelete,
  onShare,
}: PortfolioReelItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = item.type === "video";
  const isYouTube = item.type === "youtube";

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !isVideo) return;

    if (isActive) {
      el.currentTime = 0;
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive, isVideo]);

  const youTubeId = isYouTube ? getYouTubeVideoId(item.url) : null;
  const youTubeBase =
    isYouTube && youTubeId
      ? item.embedUrl || getYouTubeEmbedUrl(item.url)
      : null;
  const youTubeSrc =
    youTubeBase && youTubeId
      ? buildYouTubeEmbedSrc(youTubeBase, youTubeId)
      : null;
  const youTubeThumb = isYouTube ? getYouTubeThumbnail(item.url) : null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {isYouTube && youTubeSrc ? (
        isActive ? (
          <iframe
            src={youTubeSrc}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full"
          />
        ) : (
          <div className="relative h-full w-full">
            {youTubeThumb ? (
              <img
                src={youTubeThumb}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Play className="size-12 text-white/70" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="grid size-14 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm">
                <Play className="size-6 fill-current" />
              </span>
            </div>
          </div>
        )
      ) : isVideo ? (
        <video
          ref={videoRef}
          src={item.url}
          poster={item.thumbnailUrl}
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={item.url}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Right action column */}
      <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-5 sm:bottom-28 sm:right-5">
        <LikeButton
          itemId={item.id}
          initialLikes={item.likesCount}
          initialLiked={item.isLiked}
          variant="reel"
        />
        {onShare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(item);
            }}
            className="flex flex-col items-center gap-1 text-white transition-transform active:scale-90"
            aria-label="Share"
          >
            <span className="grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
              <Share2 className="size-5" />
            </span>
            <span className="text-[11px] font-medium">Share</span>
          </button>
        )}
        {isOwner && (
          <PortfolioActions
            item={item}
            username={username}
            onEdit={onEdit}
            onToggleFeatured={onToggleFeatured}
            onDelete={onDelete}
            onShare={onShare}
          />
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-16 z-20 p-4 pb-8 sm:right-20 sm:p-5 sm:pb-10">
        <h3 className="text-lg font-semibold text-white sm:text-xl">{item.title}</h3>
        {item.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-white/80">{item.description}</p>
        ) : null}
        {item.skills.length > 0 && (
          <p className="mt-2 line-clamp-1 text-xs text-white/70">
            {item.skills.join(" · ")}
          </p>
        )}
        {item.viewsCount > 0 && (
          <p className="mt-2 text-xs text-white/60">
            {formatCount(item.viewsCount)} views
          </p>
        )}
      </div>
    </div>
  );
}
