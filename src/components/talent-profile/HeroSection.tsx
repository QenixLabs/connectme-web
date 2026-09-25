"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ArrowLeft, BadgeCheck, MapPin, Pencil, Plane } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { TalentProfile, TalentProfilePreview } from "@/lib/api/talent";
import { formatLocation } from "./data";

export interface HeroSectionProps {
  profile: TalentProfile | TalentProfilePreview;
  viewerRole: "talent" | "recruiter" | "admin" | null;
  isOwner?: boolean;
  /** Extra bottom padding so an overlapping stats card (e.g. -mt-9) only covers padding, not content. */
  statsOverlap?: boolean;
}

export function HeroSection({
  profile,
  isOwner = false,
  statsOverlap = false,
}: HeroSectionProps) {
  const displayName =
    profile.full_legal_name?.trim() || profile.username?.trim() || "Talent";
  const roles = profile.professions || [];
  const location = formatLocation(profile.location);
  const availability = profile.availability ?? "available";

  return (
    <header className="relative">
      {/* Cover */}
      <div className="relative h-56 w-full overflow-hidden bg-background">
        {profile.hero_background && (
          <img
            src={profile.hero_background}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-slate-950/20" />
        {!isOwner && (
          <div className="absolute inset-x-0 top-4 z-10 flex items-center px-4">
            <Link
              href="/"
              aria-label="Go back"
              className="grid size-10 place-items-center rounded-full bg-card shadow-[0_6px_24px_rgba(15,23,42,0.05)]"
            >
              <ArrowLeft className="size-4 text-foreground" />
            </Link>
          </div>
        )}
      </div>

      {/* Identity band — extra bottom padding absorbs the stats card's -mt-9 overlap */}
      <div
        className={cn("relative px-4 pb-5 pt-5", statsOverlap && "pb-12")}
        style={{
          background:
            "linear-gradient(118deg, #1D4ED8 0%, #2563EB 52%, #4F46E5 100%)",
        }}
      >
        <div className="pr-[132px]">
          <h1 className="flex items-center gap-1.5 text-[18px] font-extrabold leading-tight text-brand-foreground">
            <span className="truncate">{displayName}</span>
            {profile.is_verified && (
              <BadgeCheck className="size-4.5 shrink-0 fill-brand-foreground text-brand" />
            )}
            {isOwner && (
              <Link
                href="/talent/profile"
                aria-label="Edit profile"
                className="ml-1 grid size-6 place-items-center rounded-full text-brand-foreground/80 transition-colors hover:bg-brand-foreground/15 hover:text-brand-foreground"
              >
                <Pencil className="size-3" />
              </Link>
            )}
          </h1>

          {(roles.length > 0 || location) && (
            <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-brand-foreground/80">
              {roles.length > 0 && <span>{roles.join(" | ")}</span>}
              {roles.length > 0 && location && <span className="opacity-40">|</span>}
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="truncate">{location}</span>
                </span>
              )}
            </p>
          )}

          <div className="mt-3 flex flex-nowrap items-center gap-2 whitespace-nowrap">
            {availability === "available" && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/25 px-2.5 py-1.5 text-[9px] font-semibold text-brand-foreground">
                <span className="size-1.5 rounded-full bg-success" />
                Available for Work
              </span>
            )}
            {availability === "busy" && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-warning/25 px-2.5 py-1.5 text-[9px] font-semibold text-brand-foreground">
                <span className="size-1.5 rounded-full bg-warning" />
                Busy
              </span>
            )}
            {availability === "not_available" && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-foreground/15 px-2.5 py-1.5 text-[9px] font-semibold text-brand-foreground/80">
                <span className="size-1.5 rounded-full bg-brand-foreground/50" />
                Not Available
              </span>
            )}
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-foreground/15 px-2.5 py-1.5 text-[9px] font-semibold text-brand-foreground">
              <Plane className="size-3" />
              Open to Travel
            </span>
          </div>
        </div>

        {/* Avatar ring overlapping the band, over the cover */}
        <div className="absolute -top-[31px] right-4 size-36 rounded-full bg-white p-[3px] shadow-[0_0_0_3px_rgba(37,99,235,0.12),0_10px_26px_rgba(15,23,42,0.18)]">
          <Avatar className="size-full">
            <AvatarImage src={profile.profile_photo} alt={displayName} />
            <AvatarFallback className="bg-blue-700/40 text-sm font-bold text-white">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
