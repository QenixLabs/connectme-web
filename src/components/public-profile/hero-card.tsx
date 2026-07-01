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
}

export function HeroCard({ profile, showLocation = true, showAvailability = true }: HeroCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const loc = [profile.location?.city, profile.location?.state]
    .filter(Boolean)
    .join(", ");
  const professionStr = profile.professions?.slice(0, 2).join(" / ") || "";

  const isAvailable = profile.availability === "available";

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
      <div className="relative overflow-hidden rounded-[32px] shadow-2xl">
        {/* Hero banner */}
        <div
          className="relative h-[340px] transition-colors duration-700"
          style={{
            background: showBgImage ? undefined : (imgFailed ? fallbackBg : hero.background),
            backgroundImage: showBgImage ? hero.background : undefined,
          }}
        >
          {/* Grain texture */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `
                radial-gradient(ellipse 120% 60% at 50% 30%, rgba(255,255,255,0.04) 0%, transparent 65%),
                radial-gradient(ellipse 80% 40% at 50% 85%, rgba(0,0,0,0.15) 0%, transparent 60%)
              `,
            }}
          />
          <div
            className="absolute inset-0 z-[1] opacity-[0.03] mix-blend-overlay"
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

          {/* Tier badge — top left */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/10 px-2.5 py-1">
            <Sparkles className="h-3 w-3 text-white/80" />
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/80">
              Tier {(profile.verification_tier || 1) > 3 ? 3 : profile.verification_tier || 1}
            </span>
          </div>

          {/* Verified badge — top left after tier */}
          {profile.is_verified && (
            <div
              className="absolute top-4 z-10 flex items-center gap-1 rounded-full bg-black/25 backdrop-blur-md border border-white/10 px-2.5 py-1"
              style={{ left: profile.verification_tier ? "86px" : "16px" }}
            >
              <BadgeCheck className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
              <span className="text-[10px] font-medium text-white/80 tracking-wide">Verified</span>
            </div>
          )}

          {/* Availability — top right */}
          {showAvailability && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/10 px-2.5 py-1">
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

          {/* Avatar + name cluster — centered */}
          <div className="absolute inset-x-0 top-[42px] z-10 flex flex-col items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-white/10 blur-lg" />
              <div className="relative h-[120px] w-[120px] rounded-full p-[3px] bg-gradient-to-b from-white/30 to-white/5">
                <div className="h-full w-full rounded-full bg-white/10 backdrop-blur-sm overflow-hidden ring-1 ring-white/15">
                  {profile.profile_photo ? (
                    <img
                      src={profile.profile_photo}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="h-full w-full grid place-items-center font-serif text-[52px] leading-none font-semibold text-white/30 select-none">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              {/* Verified checkmark */}
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 grid place-items-center shadow-lg ring-[3px] ring-[#1a1c2a]">
                  <BadgeCheck className="h-4 w-4 text-white" strokeWidth={2.4} />
                </div>
              )}
            </div>

            {/* Name */}
            <h1 className="mt-4 font-serif text-[26px] font-semibold text-white leading-tight tracking-tight">
              {displayName}
            </h1>

            {/* Profession + Location */}
            <div className="mt-1.5 flex items-center gap-2 text-[13px] text-white/70">
              {professionStr && <span className="font-medium text-white/90">{professionStr}</span>}
              {professionStr && loc && showLocation && (
                <span className="w-1 h-1 rounded-full bg-white/30" />
              )}
              {showLocation && loc && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-white/50" />
                  {loc}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Identity card — overlapping */}
        <div className="-mt-10 mx-3 mb-3 relative z-10">
          <div className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border/60 shadow-lg px-5 pt-4 pb-4">
            {/* Active plan badge */}
            {profile.active_plan === "talent_verified" && (
              <div className="mb-3 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft border border-gold/30 px-2.5 py-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-gold-ink" strokeWidth={2.5} />
                  <span className="text-[11px] font-medium text-gold-ink tracking-wide">Verified</span>
                </span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-1">
              <Stat
                label="Projects"
                value={String(profile.analytics?.profile_views_30d ?? "—")}
              />
              <StatDivider />
              <Stat label="Shortlists" value={String(profile.analytics?.shortlist_count ?? "—")} />
              <StatDivider />
              <Stat
                label="Trust Score"
                value={String(profile.trust_score ?? "—")}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-[20px] font-semibold text-ink leading-none">
        {value}
      </div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </div>
    </div>
  );
}

function StatDivider() {
  return <div className="w-px h-8 bg-border/60 mx-auto self-center" />;
}
