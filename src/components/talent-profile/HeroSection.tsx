"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  ShieldCheck,
  MapPin,
  Plane,
  Pencil,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TalentProfile, TalentProfilePreview } from "@/lib/api/talent";
import type { Campaign } from "@/lib/api/campaigns";
import { formatLocation } from "./data";

export interface HeroSectionProps {
  profile: TalentProfile | TalentProfilePreview;
  viewerRole: "talent" | "recruiter" | "admin" | null;
  campaigns?: Campaign[];
  campaignsLoading?: boolean;
  showActions?: boolean;
  isOwner?: boolean;
}

export function HeroSection({
  profile,
  isOwner = false,
}: HeroSectionProps) {
  const displayName =
    profile.full_legal_name?.trim() || profile.username?.trim() || "Talent";
  const roles = profile.professions || [];
  const location = formatLocation(profile.location);
  const heroImage =
    profile.hero_background || profile.profile_photo || "/heroimage.jfif";

  return (
    <div className="relative">
      {/* Cover photo */}
      <div className="relative w-full overflow-hidden rounded-b-[28px]">
        <div className="relative aspect-[3/1] w-full">
          <img
            src={heroImage}
            alt={displayName}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </div>
        {/* Spacer for card overlap */}
        <div className="h-16" />
        {/* Back button */}
        {!isOwner && (
          <div className="absolute inset-x-0 top-4 flex items-center px-5">
            <Link
              href="/"
              className="grid size-10 place-items-center rounded-full bg-card shadow-[var(--shadow-card)]"
            >
              <ArrowLeft className="size-4 text-foreground" />
            </Link>
          </div>
        )}
      </div>

      {/* Profile card overlapping cover */}
      <section className="relative z-10 -mt-16 rounded-[24px] bg-card px-5 pb-6 pt-5 shadow-[var(--shadow-card)]">
        {/* Verified badge */}
        {profile.is_verified && (
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1">
            <ShieldCheck className="size-3 text-brand" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-brand">
              Verified Talent
            </span>
          </div>
        )}

        <div className="flex items-start gap-3.5">
          {/* Identity */}
          <div className="min-w-0 flex-1 pt-0">
            <h1 className="flex items-center gap-1.5 text-[22px] font-bold leading-tight tracking-tight text-foreground">
              <span className="truncate">{displayName}</span>
              {profile.is_verified && (
                <BadgeCheck className="size-5 shrink-0 text-brand" />
              )}
              {isOwner && (
                <Link
                  href="/talent/profile"
                  aria-label="Edit profile"
                  className="ml-1 grid size-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-bg-surface-inset hover:text-foreground"
                >
                  <Pencil className="size-3" />
                </Link>
              )}
            </h1>
            {roles.length > 0 && (
              <p className="mt-1 text-[13px] font-semibold text-muted-foreground">
                {roles.join("\u00A0\u00B7\u00A0")}
              </p>
            )}
            {location && (
              <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
                <MapPin className="size-3.5 shrink-0 text-brand" />
                <span className="truncate">{location}</span>
              </p>
            )}
          </div>

          {/* Avatar */}
          <div className="relative -mt-4 shrink-0 self-start">
            <Avatar className="size-[88px] ring-4 ring-brand-soft shadow-[var(--shadow-card)]">
              <AvatarImage src={profile.profile_photo} alt={displayName} />
              <AvatarFallback className="bg-brand-soft text-lg font-bold text-brand/60">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {profile.is_verified && (
              <span className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full bg-brand text-brand-foreground ring-2 ring-card">
                <BadgeCheck className="size-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-2">
          {(profile.availability === "available" || !profile.availability) && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-success/10 px-3 text-[11px] font-semibold text-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              Available for Work
            </span>
          )}
          {profile.availability === "busy" && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-warning/10 px-3 text-[11px] font-semibold text-foreground">
              <span className="size-1.5 rounded-full bg-warning" />
              Busy
            </span>
          )}
          {profile.availability === "not_available" && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-muted px-3 text-[11px] font-semibold text-muted-foreground">
              Not Available
            </span>
          )}
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-brand-soft px-3 text-[11px] font-semibold text-brand">
            <Plane className="size-3" />
            Open to Travel
          </span>
        </div>
      </section>
    </div>
  );
}
