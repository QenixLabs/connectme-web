"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { getYouTubeVideoId } from "@/hooks/use-portfolio";
import type { PortfolioItem } from "./types";

export function PortfolioLightbox({
  items,
  initialIndex,
  open,
  onOpenChange,
}: {
  items: PortfolioItem[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goNext = useCallback(() => {
    if (items.length <= 1) return;
    setDirection("next");
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    if (items.length <= 1) return;
    setDirection("prev");
    setIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goNext();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goPrev();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 30) goNext();
      else if (e.deltaY < -30) goPrev();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
    };
  }, [open, goNext, goPrev, onOpenChange]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const startY = touchStartY.current;
    if (startY == null) return;
    const endY = e.changedTouches[0]?.clientY ?? startY;
    const diff = startY - endY;
    if (diff > 50) goNext();
    else if (diff < -50) goPrev();
    touchStartY.current = null;
  };

  if (!open || items.length === 0) return null;

  const item = items[index];
  const youtubeId = item.kind === "link" ? getYouTubeVideoId(item.url) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        onClick={() => onOpenChange(false)}
        className="absolute right-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {items.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-1/2 top-4 z-50 -translate-x-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Previous"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      {items.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Next"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      )}

      <div
        className="relative flex h-full w-full items-center justify-center p-4 md:p-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          key={item.id}
          className={cn(
            "relative max-h-full w-full max-w-5xl transition-all duration-300 ease-out",
            direction === "next" && "animate-in slide-in-from-bottom-8 fade-in",
            direction === "prev" && "animate-in slide-in-from-top-8 fade-in",
          )}
          onAnimationEnd={() => setDirection(null)}
        >
          {item.kind === "image" && (
            <img
              src={item.url || item.image}
              alt={item.title}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          )}

          {item.kind === "video" && (
            <video
              src={item.url}
              controls
              autoPlay
              muted
              playsInline
              className="max-h-[80vh] w-full rounded-lg"
            />
          )}

          {item.kind === "link" && youtubeId && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&rel=0`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}

          {item.kind === "link" && !youtubeId && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-card p-10 text-center">
              <ExternalLink className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-semibold">External link</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-gradient-teal px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                Open link <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 text-white">
        <div className="mx-auto max-w-5xl">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          {item.caption && (
            <p className="mt-1 text-sm text-white/70">{item.caption}</p>
          )}
          <p className="mt-2 text-xs text-white/50">
            {index + 1} / {items.length}
          </p>
        </div>
      </div>
    </div>
  );
}
