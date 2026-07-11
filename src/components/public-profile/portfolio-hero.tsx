"use client";

import { useState } from "react";
import { MapPin, Sparkles, BadgeCheck, ChevronDown, Eye, FolderOpen } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { resolveHeroBackground } from "@/lib/hero-color";
import type { TalentProfile, PortfolioItem } from "@/lib/validations/talent-profile.schema";

interface PortfolioHeroProps {
  profile: Partial<TalentProfile>;
  items: PortfolioItem[];
}

export function PortfolioHero({ profile, items }: PortfolioHeroProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const loc = [profile.location?.city, profile.location?.state].filter(Boolean).join(", ");
  const professionStr = profile.professions?.slice(0, 3).join(" / ") || "";
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

  const views = profile.analytics?.profile_views_30d ?? 0;
  const formatViews = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Hero background */}
      <div
        className="relative h-[75vh] min-h-[480px] max-h-[620px] transition-colors duration-700"
        style={{
          background: showBgImage ? hero.background : (imgFailed ? fallbackBg : hero.background),
        }}
      >
        {/* Hidden img for URL detection */}
        {hero.isImage && !imgFailed && (
          <img
            src={profile.hero_background!}
            alt=""
            className="hidden"
            onError={() => setImgFailed(true)}
          />
        )}

        {/* Dark overlay gradient — lighter for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/55" />

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Top badges row */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/10 px-2.5 py-1">
              <Sparkles className="h-3 w-3 text-white/80" />
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/80">
                Tier {Math.min(profile.verification_tier || 1, 3)}
              </span>
            </div>
            {profile.is_verified && (
              <div className="flex items-center gap-1 rounded-full bg-black/25 backdrop-blur-md border border-white/10 px-2.5 py-1">
                <BadgeCheck className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
                <span className="text-[10px] font-medium text-white/80 tracking-wide">Verified</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/10 px-2.5 py-1">
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
              {isAvailable ? "Available" : profile.availability === "busy" ? "Busy" : "Not Available"}
            </span>
          </div>
        </div>

        {/* Bottom identity card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-4 bottom-16 z-10"
        >
          <div className="flex items-center gap-4 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 p-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="relative h-[80px] w-[80px] sm:h-[88px] sm:w-[88px] rounded-full p-[2px] bg-gradient-to-b from-white/25 to-white/5">
                <div className="h-full w-full rounded-full bg-white/10 backdrop-blur-sm overflow-hidden ring-1 ring-white/15">
                  {profile.profile_photo ? (
                    <img
                      src={profile.profile_photo}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="h-full w-full grid place-items-center font-serif text-[36px] sm:text-[40px] leading-none font-semibold text-white/20 select-none">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              {profile.is_verified && (
                <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-emerald-500 grid place-items-center shadow-lg ring-[2px] ring-black/40">
                  <BadgeCheck className="h-3.5 w-3.5 text-white" strokeWidth={2.4} />
                </div>
              )}
            </div>

            {/* Name + details */}
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-[22px] sm:text-[26px] font-semibold text-white leading-tight tracking-tight truncate">
                {displayName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] sm:text-[14px] text-white/70">
                {professionStr && (
                  <span className="font-medium text-white/90 truncate">{professionStr}</span>
                )}
                {professionStr && loc && (
                  <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
                )}
                {loc && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-white/50 shrink-0" />
                    {loc}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom stats overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-6 left-4 right-4 z-10"
        >
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 rounded-full bg-black/25 backdrop-blur-md border border-white/10 px-4 py-2">
              <FolderOpen className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
              <span className="text-[13px] font-semibold text-white tabular-nums">{items.length}</span>
              <span className="text-[11px] text-white/60">Items</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-black/25 backdrop-blur-md border border-white/10 px-4 py-2">
              <Eye className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
              <span className="text-[13px] font-semibold text-white tabular-nums">{formatViews(views)}</span>
              <span className="text-[11px] text-white/60">Views</span>
            </div>
            {profile.analytics?.shortlist_count !== undefined && profile.analytics.shortlist_count > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-black/25 backdrop-blur-md border border-white/10 px-4 py-2">
                <BadgeCheck className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
                <span className="text-[13px] font-semibold text-white tabular-nums">{profile.analytics.shortlist_count}</span>
                <span className="text-[11px] text-white/60">Shortlists</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-4 w-4 text-white/30" strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
