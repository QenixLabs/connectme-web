"use client";

import { useState } from "react";
import {
  Share2,
  Heart,
  MapPin,
  Info,
  MessageSquare,
  MoreHorizontal,
  BadgeCheck,
  Bookmark,
} from "lucide-react";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShareProfileDialog } from "@/components/share-profile-dialog";

interface HeroCardProps {
  profile: TalentProfile;
  username: string;
  trustScore?: number;
  responseRate?: number;
  onMessage?: () => void;
  onShortlist?: () => void;
  onLike?: () => void;
}

function StatCard({
  label,
  value,
  sub,
  subClass,
  valueClass,
  icon,
  chart,
}: {
  label: string;
  value: string;
  sub?: string;
  subClass?: string;
  valueClass?: string;
  icon?: React.ReactNode;
  chart?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {label}
        {icon}
      </div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <div
          className={`text-3xl font-bold leading-none ${valueClass ?? ""}`}
        >
          {value}
        </div>
        {chart && (
          <svg viewBox="0 0 60 24" className="h-6 w-14 text-success">
            <polyline
              points="0,18 10,14 20,16 30,10 40,12 50,6 60,4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {sub && (
        <div className={`mt-1 text-xs font-medium ${subClass}`}>{sub}</div>
      )}
    </div>
  );
}

export function HeroCard({
  profile,
  username,
  trustScore = 0,
  responseRate = 95,
  onMessage,
  onShortlist,
  onLike,
}: HeroCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const professionStr =
    profile.professions?.slice(0, 3).join(" \u2022 ") || "Talent";
  const loc = [profile.location?.city, profile.location?.state, profile.location?.country]
    .filter(Boolean)
    .join(", ");

  const isAvailable = profile.availability === "available";
  const availabilityLabel = isAvailable ? "Available" : "Busy";

  return (
    <section className="px-0 pt-0 md:px-0 md:pt-0">
      <Card className="overflow-hidden border-border p-0 shadow-card">
        <div className="flex flex-col">
          {/* Photo */}
          <div className="relative aspect-[4/5] md:max-h-[480px]">
            {profile.profile_photo && !imgFailed ? (
              <img
                src={profile.profile_photo}
                alt={displayName}
                className="h-full w-full object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-6xl font-bold text-muted-foreground/30 select-none">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            {profile.is_verified && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-sm font-semibold text-primary-foreground backdrop-blur">
                <BadgeCheck className="h-4 w-4 text-amber" />
                <span className="text-amber">Root</span> Verified
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5 md:p-7">
            <div className="hidden justify-end gap-2 md:flex">
              <ShareProfileDialog
                username={username}
                profilePhoto={profile.profile_photo}
                name={profile.full_legal_name}
              >
                <Button variant="outline" size="sm" className="rounded-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </ShareProfileDialog>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={onLike}
              >
                <Heart className="mr-2 h-4 w-4" />
                Like
              </Button>
            </div>

            <div className="mt-2">
              <h1 className="flex items-center gap-2 text-4xl font-bold tracking-tight md:text-5xl">
                {displayName}
                {profile.is_verified && (
                  <BadgeCheck className="h-6 w-6 fill-primary text-primary-foreground" />
                )}
              </h1>
              <p className="mt-1 text-muted-foreground">{professionStr}</p>
              {loc && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-amber" />
                  {loc}
                </p>
              )}
            </div>

            {/* Stat cards */}
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
              <StatCard
                label="RootScore"
                value={trustScore > 0 ? String(trustScore) : "\u2014"}
                sub={trustScore >= 80 ? "Excellent" : trustScore >= 50 ? "Good" : undefined}
                subClass={trustScore >= 80 ? "text-success" : "text-amber"}
                icon={<Info className="h-3.5 w-3.5 text-muted-foreground" />}
                chart={trustScore > 0}
              />
              <StatCard
                label="Response Rate"
                value={`${responseRate}%`}
                sub="Very Responsive"
                subClass="text-primary"
              />
              <div className="hidden md:block">
                <StatCard
                  label="Availability"
                  value={availabilityLabel}
                  valueClass={
                    isAvailable ? "text-success text-2xl" : "text-amber text-2xl"
                  }
                  sub="Now"
                  subClass="text-muted-foreground"
                />
              </div>
            </div>

            {/* CTA row */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button
                className="h-11 flex-1 rounded-lg md:flex-none md:px-8"
                onClick={onMessage}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-lg md:flex-none md:px-8"
                onClick={onShortlist}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                Shortlist
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-lg"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
