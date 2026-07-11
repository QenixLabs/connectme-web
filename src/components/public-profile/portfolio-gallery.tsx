"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Eye, ExternalLink, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

function formatCount(n?: number): string {
  if (!n) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

interface PortfolioGalleryProps {
  items: PortfolioItem[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export function PortfolioGallery({ items, initialIndex, open, onClose }: PortfolioGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showInfo, setShowInfo] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setShowInfo(false);
  }, [initialIndex, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
          break;
        case "ArrowRight":
          setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, items.length]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [currentIndex]);

  if (!open || items.length === 0) return null;

  const item = items[currentIndex];
  if (!item) return null;

  const isImage = item.type === "image";
  const isVideo = item.type === "video";
  const isYoutube = item.type === "youtube";
  const isInstagram = item.type === "instagram";

  const youtubeId = isYoutube
    ? item.embed_url?.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/,
      )?.[1]
    : null;

  const handlePrev = () => {
    setShowInfo(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setShowInfo(false);
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) handlePrev();
      else handleNext();
    }

    if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const hasMeta = item.title || item.description || item.caption || item.category;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md grid place-items-center text-white hover:bg-white/20 transition-colors"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-medium">
              {currentIndex + 1}
              <span className="text-white/40">/</span>
              {items.length}
            </span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex items-center justify-center"
              >
                {isImage && item.url && (
                  <img
                    src={item.url}
                    alt={item.title || item.caption || "Portfolio"}
                    className="max-w-full max-h-full object-contain"
                    draggable={false}
                  />
                )}

                {isVideo && item.url && (
                  <video
                    src={item.url}
                    autoPlay
                    muted
                    playsInline
                    controls
                    className="max-w-full max-h-full object-contain"
                  />
                )}

                {isYoutube && youtubeId && (
                  <div className="relative w-full max-w-5xl aspect-video">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                      title={item.title || item.caption || "YouTube video"}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {isYoutube && !youtubeId && (
                  <div className="flex flex-col items-center gap-3 text-white/40">
                    <Play className="w-10 h-10" strokeWidth={1} />
                    <p className="text-sm">Video unavailable</p>
                  </div>
                )}

                {isInstagram && (
                  <div className="flex flex-col items-center justify-center gap-4 p-12">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 grid place-items-center shadow-2xl">
                      <span className="text-3xl">📸</span>
                    </div>
                    <p className="text-white/80 text-sm text-center max-w-xs">
                      {item.caption || item.title || "Instagram post"}
                    </p>
                    <a
                      href={item.embed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                      View on Instagram
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {items.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-white/10 backdrop-blur-md grid place-items-center text-white hover:bg-white/20 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-white/10 backdrop-blur-md grid place-items-center text-white hover:bg-white/20 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </>
          )}

          {hasMeta && (
            <motion.div
              className="absolute bottom-0 inset-x-0 z-20"
              initial={{ y: "calc(100% - 56px)" }}
              animate={{ y: showInfo ? 0 : "calc(100% - 56px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={() => setShowInfo(!showInfo)}
            >
              <div className="bg-gradient-to-t from-black/95 via-black/90 to-black/80 backdrop-blur-xl border-t border-white/10">
                <div className="flex justify-center -mt-3 mb-1">
                  <div className="w-10 h-1 rounded-full bg-white/20 cursor-pointer" />
                </div>

                <div className="px-5 pb-6 pt-1 space-y-1 cursor-pointer">
                  {item.title && (
                    <p className="text-white text-sm font-semibold leading-snug">
                      {item.title}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-white/75 text-xs leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {!item.title && !item.description && item.caption && (
                    <p className="text-white text-sm font-medium">{item.caption}</p>
                  )}

                  <div className="flex items-center gap-3 pt-1.5">
                    <span className="text-[11px] text-white/50 capitalize">
                      {item.category}
                    </span>
                    {(item.view_count ?? 0) > 0 && (
                      <span className="text-[11px] text-white/50 inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" strokeWidth={1.5} />
                        {formatCount(item.view_count)} views
                      </span>
                    )}
                    <span className="text-[11px] text-white/40">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {items.length > 1 && (
            <div className="absolute bottom-0 inset-x-0 z-10 pb-1">
              <div className="flex justify-center gap-1.5 px-4 overflow-x-auto no-scrollbar">
                {items.map((thumb, idx) => (
                  <button
                    key={thumb.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowInfo(false);
                    }}
                    className={cn(
                      "shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                      idx === currentIndex
                        ? "border-white shadow-md"
                        : "border-transparent opacity-50 hover:opacity-80",
                    )}
                  >
                    {thumb.type === "image" && thumb.thumbnail_url ? (
                      <img
                        src={thumb.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : thumb.type === "image" && thumb.url ? (
                      <img
                        src={thumb.url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : thumb.type === "video" && thumb.url ? (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                        <Play className="w-3 h-3 text-white/60" strokeWidth={2} />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                        <span className="text-xs text-white/40">
                          {thumb.type === "youtube" ? "YT" : "IG"}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
