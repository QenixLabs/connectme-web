"use client";

import { MapPin, Sparkles, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

interface HeroCardProps {
  profile: TalentProfile;
  showLocation?: boolean;
  showAvailability?: boolean;
}

export function HeroCard({ profile, showLocation = true, showAvailability = true }: HeroCardProps) {
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const loc = [profile.location?.city, profile.location?.state]
    .filter(Boolean)
    .join(", ");
  const professionStr = profile.professions?.slice(0, 2).join(" / ") || "";

  const isAvailable = profile.availability === "available";

  return (
    <section className="px-4 pt-5">
      <div className="relative overflow-hidden rounded-[28px] shadow-luxe-lg border border-border/60">
        {/* Layered background */}
        <div
          className="relative h-[300px]"
          style={{
            background:
              "radial-gradient(120% 80% at 20% 0%, oklch(0.42 0.06 60) 0%, transparent 55%), radial-gradient(120% 90% at 100% 100%, oklch(0.30 0.04 50) 0%, transparent 50%), linear-gradient(160deg, oklch(0.22 0.03 55) 0%, oklch(0.30 0.04 55) 60%, oklch(0.18 0.03 50) 100%)",
          }}
        >
          {/* Subtle gold grain rings */}
          <div
            className="absolute inset-0 opacity-[0.18] mix-blend-screen"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, oklch(0.74 0.13 80 / 0.5), transparent 35%), radial-gradient(circle at 80% 70%, oklch(0.74 0.13 80 / 0.35), transparent 40%)",
            }}
          />

          {/* Status chip */}
          {showAvailability && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/35 backdrop-blur-md px-2.5 py-1 border border-white/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  isAvailable ? "bg-emerald-400" : "bg-amber-400"
                )} />
                <span className={cn(
                  "relative inline-flex h-1.5 w-1.5 rounded-full",
                  isAvailable ? "bg-emerald-400" : "bg-amber-400"
                )} />
              </span>
              <span className="text-[11px] font-medium text-white tracking-wide">
                {isAvailable ? "Available" : "Busy"}
              </span>
            </div>
          )}

          {/* Tier ribbon */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-gold/15 backdrop-blur-md border border-gold/30 px-2.5 py-1">
            <Sparkles className="h-3 w-3 text-gold" />
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-gold">
              Tier {profile.verification_tier || 1}
            </span>
          </div>

          {/* Avatar */}
          <div className="absolute inset-x-0 top-12 grid place-items-center">
            <div className="relative">
              <div
                className="absolute -inset-3 rounded-[26px] blur-2xl opacity-60"
                style={{ background: "radial-gradient(circle, oklch(0.74 0.13 80 / 0.55), transparent 70%)" }}
              />
              <div className="relative h-28 w-28 rounded-[22px] p-[1.5px] bg-gradient-to-br from-gold via-gold/40 to-transparent">
                <div className="h-full w-full rounded-[20px] bg-gradient-to-br from-[oklch(0.32_0.03_55)] to-[oklch(0.20_0.03_50)] grid place-items-center overflow-hidden">
                  {profile.profile_photo ? (
                    <img
                      src={profile.profile_photo}
                      alt={displayName}
                      className="h-full w-full object-cover rounded-[20px]"
                    />
                  ) : (
                    <span className="font-serif text-[60px] leading-none font-semibold text-white/25 select-none">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              {/* verified badge */}
              {profile.is_verified && (
                <div className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full bg-gold grid place-items-center shadow-lg ring-4 ring-[oklch(0.22_0.03_55)]">
                  <BadgeCheck className="h-4 w-4 text-white" strokeWidth={2.4} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Identity card overlapping the hero base */}
        <div className="-mt-10 mx-3 mb-3 relative">
          <div className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border/70 shadow-luxe px-5 pt-4 pb-4">
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-serif text-[22px] font-semibold text-ink leading-tight">
                {displayName}
              </h1>
            </div>
            <p className="mt-1 text-[12.5px] text-ink-muted text-center flex items-center justify-center gap-1.5">
              <span className="text-ink-soft font-medium">{professionStr || "Talent"}</span>
              {professionStr && loc && showLocation && <span className="text-ink-muted/60">·</span>}
              {showLocation && loc && (
                <>
                  <MapPin className="h-3 w-3 text-gold" />
                  {loc}
                </>
              )}
            </p>

            {/* Stat strip */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Stat label="Projects" value={String(profile.analytics?.profile_views_30d ?? "42")} />
              <StatDivider />
              <Stat label="Experience" value="6+ yrs" />
              <StatDivider />
              <Stat label="Rating" value={String(profile.trust_score ? (profile.trust_score / 20).toFixed(1) : "4.9")} suffix="★" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-[18px] font-semibold text-ink leading-none">
        {value}
        {suffix && <span className="text-gold ml-0.5">{suffix}</span>}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-ink-muted">{label}</div>
    </div>
  );
}

function StatDivider() {
  return <div className="w-px h-8 bg-border/80 mx-auto self-center" />;
}
