"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Share2, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { LikeButton } from "./LikeButton";
import {
  getYouTubeEmbedUrl,
  getYouTubeVideoId,
  getYouTubeThumbnail,
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

interface MediaLightboxProps {
  items: PortfolioItem[];
  initialItemId: string | null;
  open: boolean;
  onClose: () => void;
}

export function MediaLightbox({
  items,
  initialItemId,
  open,
  onClose,
}: MediaLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open || !initialItemId) return;
    const idx = items.findIndex((i) => i.id === initialItemId);
    if (idx >= 0) setActiveIndex(idx);
  }, [open, initialItemId, items]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current;
      const child = container?.children[index] as HTMLElement | undefined;
      if (container && child) {
        container.scrollTo({ top: child.offsetTop, behavior });
      }
    },
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0 || !open) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio
            ? current
            : prev,
        );
        if (best.intersectionRatio > 0) {
          const index = Number(best.target.getAttribute("data-index"));
          if (!Number.isNaN(index)) setActiveIndex(index);
        }
      },
      { root: container, threshold: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7] },
    );

    Array.from(container.children).forEach((child) =>
      observer.observe(child),
    );
    return () => observer.disconnect();
  }, [items, open]);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      scrollToIndex(activeIndex, "auto");
    });
    return () => cancelAnimationFrame(raf);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        if (activeIndex < items.length - 1) scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (activeIndex > 0) scrollToIndex(activeIndex - 1);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [activeIndex, items.length, scrollToIndex, onClose],
  );

  if (items.length === 0) return null;

  const currentItem = items[activeIndex];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 top-0 left-0 z-50 m-0 h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-none border-none bg-black p-0"
      >
        <DialogTitle className="sr-only">
          {currentItem?.title || "Portfolio"}
        </DialogTitle>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
          aria-label="Close"
        >
          <X className="size-5" />
        </Button>

        {/* Counter */}
        {items.length > 1 && (
          <div className="absolute left-4 top-4 z-50 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {activeIndex + 1} / {items.length}
          </div>
        )}

        {/* Reel container */}
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar outline-none"
        >
          {items.map((item, index) => (
            <ReelSlide
              key={item.id}
              item={item}
              index={index}
              isActive={index === activeIndex}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReelSlide({
  item,
  index,
  isActive,
}: {
  item: PortfolioItem;
  index: number;
  isActive: boolean;
}) {
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

  const url = item.url || item.thumbnailUrl || "";
  const hasValidUrl = url.length > 0;

  const youTubeId = isYouTube ? getYouTubeVideoId(url) : null;
  const youTubeBase =
    isYouTube && youTubeId
      ? item.embedUrl || getYouTubeEmbedUrl(url)
      : null;
  const youTubeSrc =
    youTubeBase && youTubeId
      ? buildYouTubeEmbedSrc(youTubeBase, youTubeId)
      : null;
  const youTubeThumb = isYouTube ? getYouTubeThumbnail(url) : null;

  if (!hasValidUrl && !isYouTube) return null;

  return (
    <div
      data-index={index}
      className="h-[100dvh] w-full shrink-0 snap-start snap-always"
    >
      <div className="relative h-full w-full overflow-hidden bg-black">
        {/* Media */}
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
            src={url}
            poster={item.thumbnailUrl}
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={url}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Right action column */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-5 sm:bottom-28 sm:right-5">
          <LikeButton
            itemId={item.id}
            initialLikes={item.likesCount}
            initialLiked={item.isLiked}
            variant="reel"
          />
          <button
            className="flex flex-col items-center gap-1 text-white transition-transform active:scale-90"
            aria-label="Share"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="grid size-11 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
              <Share2 className="size-5" />
            </span>
            <span className="text-[11px] font-medium">Share</span>
          </button>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-16 z-20 p-4 pb-8 sm:right-20 sm:p-5 sm:pb-10">
          <h3 className="text-lg font-semibold text-white sm:text-xl">
            {item.title}
          </h3>
          {item.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-white/80">
              {item.description}
            </p>
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
    </div>
  );
}
