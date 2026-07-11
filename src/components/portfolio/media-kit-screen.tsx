"use client";

import { useState } from "react";
import {
  Download,
  Share2,
  QrCode,
  Check,
  MapPin,
  Eye,
  Play,
  Clock,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MediaKitData } from "@/types/media-kit";
import { MediaKitHeader } from "@/components/portfolio/media-kit-header";
import { ShareProfileDialog } from "@/components/share-profile-dialog";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border bg-cream border-border text-ink-soft">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero + Identity (unified)                                          */
/* ------------------------------------------------------------------ */

function MediaKitHeroIdentity({ data }: { data: MediaKitData }) {
  const [expanded, setExpanded] = useState(false);
  const displayName = data.full_legal_name || data.username || "Talent";
  const loc = [data.location?.city, data.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  return (
    <div className="px-4 pt-5">
      <div className="rounded-2xl border border-border overflow-hidden">
      {/* Hero banner */}
      <div className="relative h-48 sm:h-52 w-full bg-cream-deep">
        {data.hero_background ? (
          <img
            src={data.hero_background}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gold-soft/40 to-cream" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/40 via-card/5 to-transparent" />
      </div>

      {/* Unified card — overlaps hero bottom */}
      <div className="-mt-4 mx-3 relative z-10">
        <div className="bg-card px-5 pt-4 pb-4">
          {/* Avatar + name cluster */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="relative h-[72px] w-[72px] rounded-full border-[2px] border-border overflow-hidden bg-muted">
                {data.profile_photo ? (
                  <img
                    src={data.profile_photo}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-cream">
                    <span className="text-[28px] font-serif font-semibold text-ink-muted">
                      {displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Name + details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-[20px] font-semibold text-ink leading-tight tracking-tight truncate">
                  {displayName}
                </h1>
                {data.is_verified && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </span>
                )}
              </div>
              <p className="text-[13px] text-ink-muted mt-0.5">@{data.username}</p>
            </div>
          </div>

          {/* Profession pills + location */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {data.professions?.map((p) => <Pill key={p}>{p}</Pill>)}
            {loc && (
              <Pill>
                <MapPin className="h-3 w-3 text-gold" />
                {loc}
              </Pill>
            )}
          </div>

          {/* About text */}
          {data.about && (
            <div className="mt-3 pt-3 border-t border-border/60">
              <p
                className={cn(
                  "text-[13.5px] leading-[1.65] text-ink-soft",
                  !expanded && "line-clamp-4",
                )}
              >
                {data.about}
              </p>
              {data.about.length > 280 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[12px] font-medium text-gold mt-1 hover:text-gold/80 transition-colors"
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats Row                                                          */
/* ------------------------------------------------------------------ */

function MediaKitStats({ data }: { data: MediaKitData }) {
  const hasInstagram = (data.instagramFollowers ?? 0) > 0;
  const hasYoutube = (data.youtubeSubscribers ?? 0) > 0;

  const stats: { icon: React.ReactNode; value: string; label: string }[] = [];

  if (hasInstagram) {
    stats.push({
      icon: <FaInstagram className="w-4 h-4" />,
      value: formatCount(data.instagramFollowers ?? 0),
      label: "Instagram",
    });
  }

  if (hasYoutube) {
    stats.push({
      icon: <FaYoutube className="w-4 h-4" />,
      value: formatCount(data.youtubeSubscribers ?? 0),
      label: "YouTube",
    });
  }

  stats.push({
    icon: <Eye className="w-4 h-4" strokeWidth={1.5} />,
    value: formatCount(data.avgMonthlyViews ?? 0),
    label: "Monthly Views",
  });

  const cols = stats.length >= 3 ? 3 : stats.length;

  return (
    <div
      className="grid gap-3 px-4 mt-5"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {stats.map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="inline-flex items-center justify-center text-gold mb-1.5">
            {s.icon}
          </div>
          <p className="text-xl font-bold text-text-primary">{s.value}</p>
          <p className="text-xs text-text-tertiary mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Portfolio Highlights                                               */
/* ------------------------------------------------------------------ */

function MediaKitHighlights({ data }: { data: MediaKitData }) {
  if (data.portfolioHighlights.length === 0) return null;

  return (
    <section className="px-4 mt-5">
      <h3 className="text-[14px] font-semibold text-ink mb-3">
        Portfolio Highlights
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {data.portfolioHighlights.map((item) => (
          <div
            key={item.id}
            className="group relative bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="relative w-full pt-[100%] bg-muted">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.caption || "Portfolio image"}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                  {item.type === "video" && item.url ? (
                    <video
                      src={item.url}
                      className="absolute inset-0 w-full h-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                    />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="w-8 h-8 text-white/80" strokeWidth={1.5} />
                  </div>
                </div>
              )}

              {item.type === "video" && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 text-white text-2xs font-medium">
                  <Clock className="w-2.5 h-2.5" strokeWidth={2} />
                  <span>Video</span>
                </div>
              )}
            </div>

            <div className="p-2.5">
              <p className="text-[13px] font-medium text-text-primary truncate">
                {item.caption || "Portfolio item"}
              </p>
              <p className="text-[11px] text-text-muted capitalize mt-0.5">
                {item.category}
                {item.view_count ? (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <Eye className="w-2.5 h-2.5" strokeWidth={1.5} />
                    {formatCount(item.view_count)}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer + Action Bar                                                */
/* ------------------------------------------------------------------ */

function MediaKitFooter({ data }: { data: MediaKitData }) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/mediakit/${data.publicSlug}`
      : "";

  const handleDownloadPdf = () => {
    console.log("[TODO] PDF export not yet implemented for media kit");
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="px-4 mt-5">
      <p className="text-center text-[12px] text-ink-muted mb-4">
        This media kit is shareable with verified brands.
      </p>

      <div className="rounded-2xl bg-card border border-border shadow-luxe flex items-stretch overflow-hidden">
        <button
          onClick={handleDownloadPdf}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-ink-soft hover:bg-cream/50 transition-colors active:scale-[0.99]"
        >
          <Download className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <span className="text-[11px] font-medium">Download PDF</span>
        </button>

        <div className="w-px bg-border/60 my-2" />

        <button
          onClick={handleShareLink}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-ink-soft hover:bg-cream/50 transition-colors active:scale-[0.99]"
        >
          <Share2 className="h-5 w-5 text-gold" strokeWidth={1.5} />
          <span className="text-[11px] font-medium">Share Link</span>
        </button>

        <div className="w-px bg-border/60 my-2" />

        <ShareProfileDialog
          username={data.username}
          profilePhoto={data.profile_photo}
          name={data.full_legal_name}
          url={shareUrl}
        >
          <button
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-ink-soft hover:bg-cream/50 transition-colors active:scale-[0.99]"
          >
            <QrCode className="h-5 w-5 text-gold" strokeWidth={1.5} />
            <span className="text-[11px] font-medium">Show QR Code</span>
          </button>
        </ShareProfileDialog>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export function MediaKitScreen({ data, isOwner }: { data: MediaKitData; isOwner?: boolean }) {
  return (
    <div className="min-h-screen bg-background font-sans pb-12">
      <MediaKitHeader isOwner={isOwner} />
      <MediaKitHeroIdentity data={data} />
      <MediaKitStats data={data} />
      <MediaKitHighlights data={data} />
      <MediaKitFooter data={data} />
    </div>
  );
}
