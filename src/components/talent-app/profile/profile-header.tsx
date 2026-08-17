"use client";

import { useRef } from "react";
import { Camera, BadgeCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { InlineField } from "./inline-field";
import { TrustScoreRing } from "./trust-score-ring";
import { PublicLinkButton } from "./public-link-button";
import type { TalentProfile, UpdateTalentProfilePayload } from "@/lib/api/talent";

interface ProfileHeaderProps {
  profile: TalentProfile;
  onFieldUpdate: (field: string, value: unknown) => void;
  onPhotoSelect: (file: File) => void;
}

export function ProfileHeader({
  profile,
  onFieldUpdate,
  onPhotoSelect,
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAvailable = profile.availability === "available";

  const handleAvailabilityToggle = (checked: boolean) => {
    onFieldUpdate("availability", checked ? "available" : "busy");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      // Parent should toast; keeping here for safety
      return;
    }
    onPhotoSelect(file);
    e.target.value = "";
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-card lg:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4 lg:gap-5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative shrink-0"
            aria-label="Change profile photo"
          >
            <Avatar className="size-20 border-2 border-primary/30 lg:size-24">
              <AvatarImage src={profile.profile_photo} alt="Profile" />
              <AvatarFallback className="text-xl">
                {(profile.full_legal_name || profile.username || "?")[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted shadow-sm transition-transform group-hover:scale-110">
              <Camera className="size-3.5" />
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </button>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold leading-tight lg:text-2xl">
                {profile.full_legal_name || "Add your name"}
              </h1>
              {profile.is_verified && (
                <BadgeCheck className="size-5 shrink-0 text-primary" aria-label="Verified" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>

            <div className="pt-1">
              <InlineField
                value={profile.headline ?? ""}
                onSave={(v) =>
                  onFieldUpdate("headline", v as UpdateTalentProfilePayload["headline"])
                }
                placeholder="e.g. Actor & Model based in Mumbai"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex items-center gap-3">
            <TrustScoreRing score={profile.trust_score ?? 0} />
            <div className="text-sm">
              <p className="font-semibold">Trust Score</p>
              <p className="text-xs text-muted-foreground">
                {profile.is_verified ? "Verified" : "Unverified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Open to work</span>
            <Switch
              checked={isAvailable}
              onCheckedChange={handleAvailabilityToggle}
              aria-label="Toggle availability"
            />
          </div>

          <PublicLinkButton username={profile.username} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {profile.availability && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              profile.availability === "available"
                ? "bg-success/15 text-success"
                : profile.availability === "busy"
                  ? "bg-warning/15 text-warning"
                  : "bg-destructive/15 text-destructive"
            }`}
          >
            {profile.availability === "available"
              ? "Available for work"
              : profile.availability === "busy"
                ? "Busy"
                : "Not available"}
          </span>
        )}
        {profile.privacy_mode && (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {profile.privacy_mode === "public"
              ? "Public"
              : profile.privacy_mode === "recruiters_only"
                ? "Recruiters only"
                : "Private"}
          </span>
        )}
      </div>

      <InlineField
        label="Full legal name"
        value={profile.full_legal_name ?? ""}
        onSave={(v) =>
          onFieldUpdate("full_legal_name", v as UpdateTalentProfilePayload["full_legal_name"])
        }
        placeholder="Your full legal name"
        className="mt-4"
      />
    </Card>
  );
}
