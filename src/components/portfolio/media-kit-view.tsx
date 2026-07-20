"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Play,
  Eye,
  Bookmark,
  Share2,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShareProfileDialog } from "@/components/share-profile-dialog";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MediaKitProfile {
  username?: string;
  full_legal_name?: string;
  headline?: string;
  about?: string;
  profile_photo?: string;
  location?: { country?: string; state?: string; city?: string };
  professions?: string[];
  availability?: string;
  analytics?: {
    profile_views_7d?: number;
    profile_views_30d?: number;
    shortlist_count?: number;
  };
  social_links?: Record<string, { url?: string; visibility?: string }>;
}

interface MediaKitViewProps {
  profile: MediaKitProfile;
  items: PortfolioItem[];
  showBack?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCount(n?: number): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function availabilityMeta(v?: string) {
  switch (v) {
    case "available":
      return {
        label: "Available",
        classes: "bg-success-light text-success-text border-success-muted",
      };
    case "busy":
      return {
        label: "Busy",
        classes: "bg-brand-light text-brand-hover border-brand-muted",
      };
    case "not_available":
      return {
        label: "Not available",
        classes: "bg-error-light text-error-text border-error-muted",
      };
    default:
      return {
        label: "Unknown",
        classes: "bg-muted-bg text-text-secondary border-border",
      };
  }
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 text-xs rounded-full bg-muted-bg text-text-secondary border border-border font-medium">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero + Identity (unified)                                          */
/* ------------------------------------------------------------------ */

function MediaKitHero({ profile }: { profile: MediaKitProfile }) {
  const loc = [profile.location?.city, profile.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  const avail = availabilityMeta(profile.availability);
  const displayName = profile.full_legal_name || profile.username || "Talent";

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      {/* Hero cover */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-brand/20 to-brand/5">
        {profile.profile_photo ? (
          <img
            src={profile.profile_photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-card/40 via-card/10 to-transparent" />
      </div>

      {/* Unified card — overlaps hero bottom */}
      <div className="-mt-4 mx-3 relative z-10">
        <div className="bg-card px-5 pt-4 pb-4">
          {/* Avatar + name cluster */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="relative h-[72px] w-[72px] sm:h-[80px] sm:w-[80px] rounded-full border-[2px] border-border overflow-hidden bg-muted">
                {profile.profile_photo ? (
                  <img
                    src={profile.profile_photo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="h-full w-full grid place-items-center font-serif text-[28px] sm:text-[32px] leading-none font-semibold text-text-muted select-none">
                    {displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Name + details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary truncate">
                  {displayName}
                </h2>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </span>
              </div>
              {profile.username && (
                <p className="text-sm text-text-tertiary">@{profile.username}</p>
              )}
            </div>
          </div>

          {/* Availability + professions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {profile.availability && (
              <span
                className={cn(
                  "px-2.5 py-0.5 text-xs font-medium rounded-full border",
                  avail.classes
                )}
              >
                {avail.label}
              </span>
            )}
            {profile.professions?.map((p) => (
              <Tag key={p}>{p}</Tag>
            ))}
          </div>

          {/* Location */}
          {loc && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              {loc}
            </div>
          )}

          {/* About / Headline */}
          {(profile.about || profile.headline) && (
            <div className="mt-3 pt-3 border-t border-border/60">
              <p className="text-sm text-text-secondary leading-relaxed">
                {profile.about || profile.headline}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

function MediaKitStats({ profile }: { profile: MediaKitProfile }) {
  const stats = [
    {
      icon: Eye,
      value: formatCount(profile.analytics?.profile_views_30d),
      label: "Monthly Views",
    },
    {
      icon: Bookmark,
      value: formatCount(profile.analytics?.shortlist_count),
      label: "Shortlists",
    },
    {
      icon: Share2,
      value: String(
        Object.values(profile.social_links ?? {}).filter((l) => l?.url).length,
      ),
      label: "Social Links",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 px-5 sm:px-6 mt-5">
      {stats.map((s) => (
        <Card
          key={s.label}
          className="p-3 text-center border-border-subtle bg-muted-bg/50"
        >
          <s.icon className="w-4 h-4 mx-auto text-brand mb-1.5" strokeWidth={1.5} />
          <p className="text-lg font-bold text-text-primary">{s.value}</p>
          <p className="text-2xs text-text-muted">{s.label}</p>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Grid                                                               */
/* ------------------------------------------------------------------ */

function MediaKitGrid({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) {
    return (
      <div className="px-5 sm:px-6 mt-6">
        <p className="text-sm text-text-muted text-center py-8">
          No portfolio items yet.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-6 mt-6">
      <h3 className="text-base font-semibold text-text-primary mb-3">
        Portfolio Highlights
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
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
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black"
                >
                  <video
                    src={item.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                    draggable={false}
                    onMouseEnter={(e) => {
                      e.currentTarget.play()?.catch(() => {});
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="w-8 h-8 text-white/80" strokeWidth={1.5} />
                  </div>
                </div>
              )}

              {/* Category badge */}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-black/60 text-white uppercase"
                >
                  {item.category}
                </span>
              </div>
            </div>

            {item.caption && (
              <div className="p-2.5">
                <p className="text-xs text-text-primary truncate">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function MediaKitFooter({ profile }: { profile: MediaKitProfile }) {
  return (
    <div className="px-5 sm:px-6 py-5 mt-4 border-t border-border-subtle">
      <div className="flex items-center justify-center gap-3">
        <ShareProfileDialog
          username={profile.username}
          profilePhoto={profile.profile_photo}
          name={profile.full_legal_name}
          url={`${typeof window !== "undefined" ? window.location.origin : ""}/talent/${profile.username}/portfolio`}
        >
          <Button
            variant="outline"
            size="sm"
            className="flex-1 max-w-[200px]"
          >
            <Share2 className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
            Share Link
          </Button>
        </ShareProfileDialog>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export function MediaKitView({ profile, items, showBack = true }: MediaKitViewProps) {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto pb-6">
      {showBack && (
        <div className="px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Back
          </button>
        </div>
      )}

      <Card className="overflow-visible border-border-subtle">
        <MediaKitHero profile={profile} />
        <MediaKitStats profile={profile} />
        <MediaKitGrid items={items} />
        <MediaKitFooter profile={profile} />
      </Card>
    </div>
  );
}
