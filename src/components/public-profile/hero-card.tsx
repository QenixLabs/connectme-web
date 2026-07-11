"use client";

import { useState } from "react";
import { MapPin, Sparkles, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveHeroBackground } from "@/lib/hero-color";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

interface HeroCardProps {
  profile: TalentProfile;
  showLocation?: boolean;
  showAvailability?: boolean;
  about?: string;
}

export function HeroCard({
  profile,
  showLocation = true,
  showAvailability = true,
  about,
}: HeroCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const loc = [profile.location?.city, profile.location?.state]
    .filter(Boolean)
    .join(", ");
  const professionStr = profile.professions?.slice(0, 2).join(" / ") || "";

  const isAvailable = profile.availability === "available";
  const aboutText = about || "";

  const hero = resolveHeroBackground(
    imgFailed ? undefined : profile.hero_background,
    profile.username ?? "default",
  );
  const fallbackBg = resolveHeroBackground(
    undefined,
    profile.username ?? "default",
  ).background;
  const showBgImage = hero.isImage && !imgFailed;

  return (
    <section className="px-4 pt-5">
      <div className="rounded-2xl border border-border overflow-hidden">
      {/* Hero banner */}
      <div
        className="relative h-[280px] transition-colors duration-700"
        style={{
          background: showBgImage ? hero.background : (imgFailed ? fallbackBg : hero.background),
        }}
      >
        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }}
        />

        {/* Hidden img for URL detection */}
        {hero.isImage && !imgFailed && (
          <img
            src={profile.hero_background!}
            alt=""
            className="hidden"
            onError={() => setImgFailed(true)}
          />
        )}

        {/* Bottom gradient fade for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/50 via-black/10 to-transparent z-[2] pointer-events-none" />

        {/* Tier badge — top left */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/25 border border-white/10 px-2.5 py-1">
          <Sparkles className="h-3 w-3 text-white/80" />
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/80">
            Tier {(profile.verification_tier || 1) > 3 ? 3 : profile.verification_tier || 1}
          </span>
        </div>

        {/* Verified badge — top left after tier */}
        {profile.is_verified && (
          <div
            className="absolute top-4 z-10 flex items-center gap-1 rounded-full bg-black/25 border border-white/10 px-2.5 py-1"
            style={{ left: profile.verification_tier ? "86px" : "16px" }}
          >
            <BadgeCheck className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
            <span className="text-[10px] font-medium text-white/80 tracking-wide">Verified</span>
          </div>
        )}

        {/* Availability — top right */}
        {showAvailability && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/25 border border-white/10 px-2.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  isAvailable ? "bg-emerald-400" : "bg-amber-400",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-1.5 w-1.5 rounded-full",
                  isAvailable ? "bg-emerald-400" : "bg-amber-400",
                )}
              />
            </span>
            <span className="text-[10px] font-medium text-white/80 tracking-wide">
              {isAvailable ? "Available" : "Busy"}
            </span>
          </div>
        )}
      </div>

      {/* Unified identity + bio card */}
      <div>
        <div className="bg-card px-5 pt-4 pb-4">
          {/* Avatar + name cluster */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="relative h-[72px] w-[72px] rounded-full border-[2px] border-border overflow-hidden bg-muted">
                {profile.profile_photo ? (
                  <img
                    src={profile.profile_photo}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="h-full w-full grid place-items-center font-serif text-[32px] leading-none font-semibold text-ink-muted select-none">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {profile.is_verified && (
                <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-500 grid place-items-center shadow-sm ring-[2px] ring-card">
                  <BadgeCheck className="h-3 w-3 text-white" strokeWidth={2.4} />
                </div>
              )}
            </div>

            {/* Name + details */}
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-[20px] font-semibold text-ink leading-tight tracking-tight truncate">
                {displayName}
              </h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-ink-soft">
                {professionStr && <span className="font-medium text-ink truncate">{professionStr}</span>}
                {professionStr && loc && showLocation && (
                  <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                )}
                {showLocation && loc && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-gold shrink-0" />
                    {loc}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* About text */}
          {aboutText && (
            <div className="mt-3 pt-3 border-t border-border/60">
              <p
                className={cn(
                  "text-[13.5px] leading-[1.65] text-ink-soft",
                  !aboutExpanded && "line-clamp-3",
                )}
              >
                {aboutText}
              </p>
              {aboutText.length > 250 && (
                <button
                  onClick={() => setAboutExpanded(!aboutExpanded)}
                  className="mt-1 text-[12px] font-medium text-gold hover:text-gold/80 transition-colors"
                >
                  {aboutExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}

          {/* Profession pills */}
          {profile.professions && profile.professions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.professions.map((profession) => (
                <Pill key={profession} gold>{profession}</Pill>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}

function Pill({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border ${
        gold
          ? "bg-gold-soft border-gold/40 text-gold-ink"
          : "bg-cream border-border text-ink-soft"
      }`}
    >
      {children}
    </span>
  );
}
