"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { Eye, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { PortfolioTypeBadge } from "./PortfolioTypeBadge";
import { LikeButton } from "./LikeButton";
import { formatCount, getYouTubeEmbedUrl } from "@/hooks/use-portfolio";

interface PortfolioDetailModalProps {
  items: PortfolioItem[];
  initialItem: PortfolioItem | null;
  open: boolean;
  onClose: () => void;
}

export function PortfolioDetailModal({
  items,
  initialItem,
  open,
  onClose,
}: PortfolioDetailModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!open || !initialItem?.id) return;

    const el = itemRefs.current[initialItem.id];
    if (el && contentRef.current) {
      contentRef.current.scrollTo({ top: el.offsetTop, behavior: "auto" });
    }
  }, [open, initialItem?.id]);

  if (!initialItem || items.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        className="max-h-[95vh] max-w-4xl overflow-y-auto border-border bg-card p-0"
      >
        <DialogTitle className="sr-only">Portfolio</DialogTitle>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          className="fixed right-4 top-4 z-50 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>

        <div className="divide-y divide-border">
          {items.map((item) => {
            const isVideo = item.type === "video";
            const isYouTube = item.type === "youtube";
            const youTubeSrc = isYouTube
              ? getYouTubeEmbedUrl(item.embedUrl || item.url) || item.embedUrl
              : null;

            return (
              <article
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                className="scroll-mt-0"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  {isYouTube && youTubeSrc ? (
                    <iframe
                      src={youTubeSrc}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  ) : isVideo ? (
                    <video
                      src={item.url}
                      poster={item.thumbnailUrl}
                      controls
                      className="h-full w-full"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  )}

                  {!isYouTube && !isVideo && (
                    <div className="absolute bottom-4 left-4">
                      <PortfolioTypeBadge type={item.type} />
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-8">
                  <PortfolioTypeBadge type={item.type} className="mb-2" />
                  <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                    {item.title}
                  </h2>
                  {item.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.description}
                    </p>
                  ) : null}

                  {item.skills.length > 0 && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {item.skills.join(" · ")}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-border pt-5">
                    <LikeButton
                      itemId={item.id}
                      initialLikes={item.likesCount}
                      initialLiked={item.isLiked}
                    />
                    {item.viewsCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Eye className="size-4" />
                        {formatCount(item.viewsCount)} views
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
