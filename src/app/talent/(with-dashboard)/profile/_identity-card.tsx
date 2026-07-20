"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ShieldCheck,
  ChevronRight,
  Pencil,
  LayoutGrid,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ShareProfileDialog } from "@/components/share-profile-dialog";
import { resolveHeroBackground } from "@/lib/hero-color";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

function availabilityClass(v?: string) {
  switch (v) {
    case "available":
      return "bg-success-light text-success-text border-success-muted";
    case "busy":
      return "bg-gold-soft text-gold-ink border-gold/30";
    case "not_available":
      return "bg-error-light text-error-text border-error-muted";
    default:
      return "bg-cream text-ink-soft border-border";
  }
}

function completenessClass(pct?: number) {
  if (pct === undefined)
    return {
      cls: "bg-cream text-ink-soft border-border",
      label: "Starter",
    };
  if (pct >= 80)
    return {
      cls: "bg-success-light text-success-text border-success-muted",
      label: "Excellent",
    };
  if (pct >= 60)
    return {
      cls: "bg-success-light text-success-text border-success-muted",
      label: "Advanced",
    };
  if (pct >= 40)
    return {
      cls: "bg-gold-soft text-gold-ink border-gold/30",
      label: "Intermediate",
    };
  if (pct >= 20)
    return {
      cls: "bg-cream text-ink-soft border-border",
      label: "Beginner",
    };
  return { cls: "bg-cream text-ink-soft border-border", label: "Starter" };
}

export interface IdentityCardProps {
  profile: TalentProfile;
  completeness?: number;
  verificationTier?: number;
  onEdit?: () => void;
  onPortfolio?: () => void;
}

export function IdentityCard({
  profile,
  completeness,
  verificationTier,
  onEdit,
  onPortfolio,
}: IdentityCardProps) {
  const router = useRouter();
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const isVerified = (verificationTier ?? 0) >= 2;
  const availCls = availabilityClass(profile.availability);
  const comp = completenessClass(completeness);
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const hero = resolveHeroBackground(
    heroImgFailed ? undefined : profile.hero_background,
    profile.username ?? "default",
  );
  const fallbackBg = resolveHeroBackground(
    undefined,
    profile.username ?? "default",
  ).background;
  const showBgImage = hero.isImage && !heroImgFailed;

  return (
    <Card className="rounded-2xl overflow-hidden p-0 gap-0">
      {/* Hero background banner */}
      <div
        className="relative h-28 transition-colors duration-700"
        style={{
          background: showBgImage
            ? hero.background
            : heroImgFailed
              ? fallbackBg
              : hero.background,
        }}
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 60% at 50% 30%, rgba(255,255,255,0.04) 0%, transparent 65%),
              radial-gradient(ellipse 80% 40% at 50% 85%, rgba(0,0,0,0.15) 0%, transparent 60%)
            `,
          }}
        />
        {hero.isImage && !heroImgFailed && (
          <img
            src={profile.hero_background}
            alt=""
            className="hidden"
            onError={() => setHeroImgFailed(true)}
          />
        )}
      </div>

      {/* Avatar + name section */}
      <div className="flex items-center gap-3 p-5">
        <div className="relative shrink-0">
          {profile.profile_photo ? (
            <img
              src={profile.profile_photo}
              alt=""
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold bg-gradient-to-br from-gold-warm to-gold-dark font-serif">
              {initials}
            </div>
          )}
          {isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white bg-gold">
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[19px] font-semibold text-ink leading-tight truncate font-serif">
              {displayName}
            </h1>
            {isVerified && (
              <BadgeCheck
                className="w-[18px] h-[18px] shrink-0 text-gold"
                strokeWidth={1.5}
              />
            )}
          </div>
          {isVerified && (
            <div className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-muted">
              <ShieldCheck className="w-[14px] h-[14px] text-gold" />
              Account Verified
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span
              className={cn(
                "text-[11px] px-2 py-0.5 rounded-full font-medium border",
                availCls,
              )}
            >
              {profile.availability || "Unknown"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border",
                comp.cls,
              )}
            >
              {comp.label}
            </span>
            {profile.professions?.slice(0, 1).map((p) => (
              <span
                key={p}
                className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-cream text-ink-soft border border-border"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-3 grid grid-cols-3 gap-2">
        <button
          onClick={onPortfolio}
          className="h-[34px] rounded-[10px] flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink-soft bg-cream-soft border border-border transition-colors hover:bg-cream-hover"
        >
          <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
          Portfolio
        </button>
        <button
          onClick={onEdit}
          className="h-[34px] rounded-[10px] flex items-center justify-center gap-1.5 text-[12px] font-medium text-white bg-ink border border-ink transition-colors"
        >
          <Pencil className="w-4 h-4" strokeWidth={1.5} />
          {completeness !== undefined && completeness < 100
            ? "Complete"
            : "Edit"}
        </button>
        <ShareProfileDialog
          username={profile.username}
          profilePhoto={profile.profile_photo}
          name={profile.full_legal_name}
        >
          <button className="h-[34px] rounded-[10px] flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink-soft bg-cream-soft border border-border transition-colors hover:bg-cream-hover w-full">
            <Share2 className="w-4 h-4" strokeWidth={1.5} />
            Share
          </button>
        </ShareProfileDialog>
      </div>

      <div className="h-px bg-border" />

      {/* Verification row */}
      <button
        onClick={() => router.push("/talent/verify-documents")}
        className="flex w-full items-center gap-3 p-5 text-left"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-gold-bright to-gold-dark">
          <ShieldCheck
            size={22}
            className="text-white"
            strokeWidth={1.5}
          />
        </span>
        <span className="flex-1">
          <span className="block text-[16px] font-semibold text-ink">
            {isVerified ? "Verified" : "Verify Identity"}
          </span>
          <span className="block text-[13px] text-ink-muted">
            {isVerified
              ? "Passed ID verification"
              : "Build trust with recruiters"}
          </span>
        </span>
        <ChevronRight
          size={18}
          className="text-ink-muted/40"
          strokeWidth={2}
        />
      </button>
    </Card>
  );
}
