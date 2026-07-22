"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Bookmark,
  MessageCircle,
  MapPin,
  Pencil,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveHeroBackground } from "@/lib/hero-color";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

interface TalentCardProps {
  profile?: TalentProfile | null;
  sample?: boolean;
  onSave?: () => void;
  onMessage?: () => void;
  onViewProfile?: () => void;
  onEdit?: () => void;
  isOwner?: boolean;
  onViewPortfolio?: () => void;
  heroBackground?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Dummy data                                                         */
/* ------------------------------------------------------------------ */
const SAMPLE_PROFILE: Partial<TalentProfile> = {
  username: "ananya_kapoor",
  full_legal_name: "Ananya Kapoor",
  headline: "Actor & Model | Commercials, TV, Film",
  profile_photo: "",
  location: { country: "India", state: "Maharashtra", city: "Mumbai" },
  professions: ["Actor", "Model"],
  availability: "available",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function showStr(v?: string | null): string {
  return v && v.trim() !== "" ? v : "";
}

function availabilityMeta(v?: string | null) {
  switch (v) {
    case "available":
      return {
        label: "Available",
        classes:
          "bg-success-light text-success-text border-success-muted",
      };
    case "busy":
      return {
        label: "Busy",
        classes:
          "bg-brand-light text-brand-hover border-brand-muted",
      };
    case "not_available":
      return {
        label: "Not available",
        classes:
          "bg-error-light text-error-text border-error-muted",
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
    <span className="px-2.5 py-1 text-xs rounded-full bg-muted-bg text-text-secondary border border-border font-medium break-words max-w-full">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export function TalentCard({
  profile,
  sample,
  onSave,
  onMessage,
  onViewProfile,
  onEdit,
  isOwner,
  onViewPortfolio,
  heroBackground,
}: TalentCardProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const data = sample ? (SAMPLE_PROFILE as TalentProfile) : profile;

  if (!data) return null;

  const loc = [data.location?.city, data.location?.state, data.location?.country]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  const avail = availabilityMeta(data.availability);
  const displayName = showStr(data.full_legal_name) || data.username || "Talent";
  const hero = resolveHeroBackground(
    heroImgFailed ? undefined : heroBackground,
    data.username ?? "default",
  );
  const fallbackBg = resolveHeroBackground(
    undefined,
    data.username ?? "default",
  ).background;
  const showBgImage = hero.isImage && !heroImgFailed;

  return (
    <Card className="relative hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      {/* Hero background banner */}
      {heroBackground && (
        <>
          <div
            className="relative h-28 transition-colors duration-700"
            style={{
              background: showBgImage ? undefined : (heroImgFailed ? fallbackBg : hero.background),
              backgroundImage: showBgImage ? hero.background : undefined,
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
                src={heroBackground}
                alt=""
                className="hidden"
                onError={() => setHeroImgFailed(true)}
              />
            )}
          </div>
        </>
      )}
      <div className="p-5">
        {onEdit && (
          <Button
            variant="outline"
            onClick={onEdit}
            className="absolute top-3 right-3 px-3 py-2 h-auto"
          >
            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline ml-1.5 text-xs sm:text-sm">Edit</span>
          </Button>
        )}
        {/* Avatar + Info */}
        <div className="flex items-start gap-4">
          <Avatar
            name={displayName}
            src={data.profile_photo}
            size="lg"
            className="border border-border"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-text-primary break-words min-w-0">
                {displayName}
              </h3>
              {data.is_verified && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </span>
              )}
            </div>

            {data.username && (
              <p className="text-sm text-text-tertiary break-all">@{data.username}</p>
            )}

            {data.headline && (
              <p className="text-sm text-text-secondary mt-1 line-clamp-2 break-words">
                {data.headline}
              </p>
            )}

            {loc && (
              <div className="flex items-start gap-1 mt-1.5">
                <MapPin
                  className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <span className="text-xs text-text-muted break-words min-w-0">{loc}</span>
              </div>
            )}
          </div>
        </div>

        {/* Availability + Professions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "px-2.5 py-0.5 text-xs font-medium rounded-full border",
              avail.classes
            )}
          >
            {avail.label}
          </span>
          {data.professions?.map((p) => (
            <Tag key={p}>{p}</Tag>
          ))}
        </div>

        {/* Actions */}
        {(onSave || onMessage || onViewPortfolio) && (
          <div className="mt-5 flex items-center gap-2">
            {onSave && (
              <Button
                variant="secondary"
                className="flex-1 h-10 rounded-xl"
                onClick={onSave}
              >
                <Bookmark className="w-4 h-4" strokeWidth={1.5} />
                Save
              </Button>
            )}
            {onMessage && (
              <Button
                variant="primary"
                className="flex-1 h-10 rounded-xl"
                onClick={onMessage}
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                Message
              </Button>
            )}
            {onViewPortfolio && (
              <Button
                variant="outline"
                className="flex-1 h-10 rounded-xl"
                onClick={onViewPortfolio}
              >
                <Images className="w-4 h-4" strokeWidth={1.5} />
                Portfolio
              </Button>
            )}
          </div>
        )}

        {/* View full profile */}
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
          >
            View full profile
            <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </Card>
  );
}
