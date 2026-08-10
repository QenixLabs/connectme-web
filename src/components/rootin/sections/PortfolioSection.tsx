"use client";

import { Clapperboard, Image, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, SectionHead, EmptyState } from "../primitives";
import { getDisplayMode } from "./types";
import type { DisplayMode, PortfolioItem } from "./types";

function getInternalSpan(mode: DisplayMode): string {
  if (mode === "expanded") return "col-span-8";
  return "col-span-4";
}

interface PortfolioMediaProps {
  items: PortfolioItem[];
  title: string;
  icon: React.ReactNode;
  emptyMessage: string;
}

function PortfolioMedia({ items, title, icon, emptyMessage }: PortfolioMediaProps) {
  const mode = getDisplayMode(items.length);

  if (mode === "empty") {
    return (
      <div className="transition-all duration-300 ease-out">
        <h3 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/35">
          {icon}
          {title}
        </h3>
        <EmptyState icon={icon} message={emptyMessage} />
      </div>
    );
  }

  const span = getInternalSpan(mode);

  return (
    <div className={cn("transition-all duration-300 ease-out", span)}>
      <h3 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/35">
        {icon}
        {title}
      </h3>
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          mode === "compact"
            ? "grid grid-cols-2 gap-3"
            : mode === "normal"
              ? "grid grid-cols-2 gap-3"
              : "grid grid-cols-2 gap-3 overflow-auto",
        )}
        style={mode === "expanded" ? { maxHeight: "min(480px, 60vh)" } : undefined}
      >
        {items.map((p, i) => (
          <button
            key={`${p.title}-${i}`}
            className={cn(
              "group text-left transition-all duration-300 ease-out",
              mode === "compact" && items.length === 1 && "col-span-full",
            )}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-xl border transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-[var(--shadow-card-lift)]",
                mode === "compact" ? "aspect-video w-full" : "aspect-4/3 w-full",
              )}
              style={{ borderColor: "var(--border-card)" }}
            >
              <img
                src={p.img}
                alt={`${p.category} \u2013 ${p.title}`}
                loading="lazy"
                width={640}
                height={512}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, transparent 35%, oklch(0 0 0 / 0.2) 65%, oklch(0 0 0 / 0.6) 100%)",
                }}
              />
              {p.type === "video" && (
                <span className="absolute inset-0 grid place-items-center">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur-sm transition-all duration-200 group-hover:scale-110"
                    style={{ animation: "subtle-pulse 2s ease-in-out infinite" }}
                  >
                    <Play width={16} height={16} className="fill-current text-white" />
                  </span>
                </span>
              )}
              {p.duration && (
                <span className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                  {p.duration}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs font-medium text-muted-foreground/60">
              {p.category} <span className="text-muted-foreground/40">&bull;</span> {p.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export interface PortfolioSectionProps {
  videos: PortfolioItem[];
  photos: PortfolioItem[];
  scroll?: boolean;
  className?: string;
}

export function PortfolioSection({ videos, photos, scroll = false, className }: PortfolioSectionProps) {
  const hasAny = videos.length > 0 || photos.length > 0;

  return (
    <Card prominent className={cn("transition-all duration-300 ease-out", className)}>
      <SectionHead
        icon={<Clapperboard width={16} height={16} />}
        title="Portfolio Highlights"
        action="View All"
      />

      {!hasAny ? (
        <div className="flex flex-col gap-6">
          <PortfolioMedia
            items={videos}
            title="Videos"
            icon={<Clapperboard width={14} height={14} />}
            emptyMessage="No videos uploaded yet."
          />
          <PortfolioMedia
            items={photos}
            title="Photos"
            icon={<Image width={14} height={14} />}
            emptyMessage="No photos uploaded yet."
          />
        </div>
      ) : scroll ? (
        <div className="flex flex-col gap-6">
          {videos.length > 0 ? (
            <div className="transition-all duration-300 ease-out">
              <h3 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/35">
                <Clapperboard width={14} height={14} />
                Videos
              </h3>
              <div className="overflow-hidden">
                <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1">
                  {videos.map((p, i) => (
                    <button
                      key={`video-${p.title}-${i}`}
                      className="group w-44 shrink-0 snap-start text-left"
                    >
                      <div
                        className="relative aspect-4/3 overflow-hidden rounded-xl border transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-[var(--shadow-card-lift)]"
                        style={{ borderColor: "var(--border-card)" }}
                      >
                        <img
                          src={p.img}
                          alt={`Video \u2013 ${p.title}`}
                          loading="lazy"
                          width={640}
                          height={512}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage:
                              "linear-gradient(180deg, transparent 35%, oklch(0 0 0 / 0.2) 65%, oklch(0 0 0 / 0.6) 100%)",
                          }}
                        />
                        <span className="absolute inset-0 grid place-items-center">
                          <span
                            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur-sm transition-all duration-200 group-hover:scale-110"
                            style={{ animation: "subtle-pulse 2s ease-in-out infinite" }}
                          >
                            <Play width={16} height={16} className="fill-current text-white" />
                          </span>
                        </span>
                        {p.duration && (
                          <span className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                            {p.duration}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs font-medium text-muted-foreground/60">
                        {p.category} <span className="text-muted-foreground/40">&bull;</span> {p.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="transition-all duration-300 ease-out">
              <h3 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/35">
                <Clapperboard width={14} height={14} />
                Videos
              </h3>
              <EmptyState icon={<Clapperboard width={14} height={14} />} message="No videos uploaded yet." />
            </div>
          )}

          {photos.length > 0 ? (
            <div className="transition-all duration-300 ease-out">
              <h3 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/35">
                <Image width={14} height={14} />
                Photos
              </h3>
              <div className="overflow-hidden">
                <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1">
                  {photos.map((p, i) => (
                    <button
                      key={`photo-${p.title}-${i}`}
                      className="group w-44 shrink-0 snap-start text-left"
                    >
                      <div
                        className="relative aspect-4/3 overflow-hidden rounded-xl border transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-[var(--shadow-card-lift)]"
                        style={{ borderColor: "var(--border-card)" }}
                      >
                        <img
                          src={p.img}
                          alt={`Photo \u2013 ${p.title}`}
                          loading="lazy"
                          width={640}
                          height={512}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage:
                              "linear-gradient(180deg, transparent 35%, oklch(0 0 0 / 0.2) 65%, oklch(0 0 0 / 0.6) 100%)",
                          }}
                        />
                        {p.duration && (
                          <span className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                            {p.duration}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs font-medium text-muted-foreground/60">
                        {p.category} <span className="text-muted-foreground/40">&bull;</span> {p.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="transition-all duration-300 ease-out">
              <h3 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/35">
                <Image width={14} height={14} />
                Photos
              </h3>
              <EmptyState icon={<Image width={14} height={14} />} message="No photos uploaded yet." />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <PortfolioMedia
            items={videos.slice(0, 2)}
            title="Videos"
            icon={<Clapperboard width={14} height={14} />}
            emptyMessage="No videos uploaded yet."
          />
          <PortfolioMedia
            items={photos.slice(0, 2)}
            title="Photos"
            icon={<Image width={14} height={14} />}
            emptyMessage="No photos uploaded yet."
          />
        </div>
      )}
    </Card>
  );
}
