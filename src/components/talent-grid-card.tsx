"use client";

import { Check, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileWithAccess = Partial<{
  _id?: string;
  user_id?: string;
  username?: string;
  full_legal_name?: string;
  headline?: string;
  profile_photo?: string;
  location?: { country?: string; state?: string; city?: string };
  professions?: string[];
  industries?: string[];
  languages?: Array<{ name?: string; fluency?: string }>;
  skills?: Array<{ name?: string; proficiency?: string }>;
  availability?: string;
  privacy_mode?: string;
  is_verified?: boolean;
  gender?: string;
  date_of_birth?: string;
  about?: string;
  physical_attributes?: Record<string, unknown>;
  social_links?: Record<string, unknown>;
  documents?: Record<string, unknown>;
}>;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getProfileCompletion(profile: ProfileWithAccess): number {
  const checks: unknown[] = [
    profile.username,
    profile.full_legal_name,
    profile.profile_photo,
    profile.headline,
    profile.about,
    profile.gender,
    profile.date_of_birth,
    profile.location?.city,
    profile.location?.state,
    profile.location?.country,
    profile.professions?.length ? profile.professions : null,
    profile.industries?.length ? profile.industries : null,
    profile.languages?.length ? profile.languages : null,
    profile.skills?.length ? profile.skills : null,
    profile.availability,
    profile.physical_attributes && Object.keys(profile.physical_attributes).length > 0
      ? profile.physical_attributes
      : null,
    profile.social_links && Object.keys(profile.social_links).length > 0
      ? profile.social_links
      : null,
    profile.documents && Object.keys(profile.documents).length > 0
      ? profile.documents
      : null,
  ];
  const filled = checks.filter((v) => v !== undefined && v !== null && v !== "" && v !== false).length;
  const total = checks.length;
  return Math.round((filled / total) * 100);
}

function getGradientSeed(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getGradient(name: string): string {
  const seed = getGradientSeed(name);
  const hues = [
    [25, 45],   // warm brown/amber
    [35, 55],   // golden
    [200, 220], // slate blue
    [150, 170], // sage green
    [280, 300], // muted purple
    [10, 25],   // rust
    [180, 200], // teal
    [320, 340], // mauve
  ];
  const pair = hues[seed % hues.length];
  const h1 = pair[0] + (seed % 15);
  const h2 = pair[1] + (seed % 15);
  return `linear-gradient(135deg, hsl(${h1}, 35%, 65%), hsl(${h2}, 40%, 45%))`;
}

interface TalentGridCardProps {
  profile: ProfileWithAccess;
  onViewProfile: () => void;
  onInvite?: () => void;
  onConnect?: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function TalentGridCard({
  profile,
  onViewProfile,
  onInvite,
  onConnect,
  selectable,
  isSelected,
  onToggleSelect,
}: TalentGridCardProps) {
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const loc = profile.location?.city || profile.location?.state || "";
  const profession = profile.professions?.[0] ?? profile.industries?.[0] ?? "";
  const completion = getProfileCompletion(profile);

  return (
    <article
      className={cn(
        "bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md",
        isSelected && "border-brand ring-1 ring-brand"
      )}
      onClick={(e) => {
        if (!selectable) {
          onViewProfile();
          return;
        }
        const target = e.target as HTMLElement;
        if (target.closest("button, a, input, [role='button']")) return;
        onToggleSelect?.();
      }}
    >
      {/* Photo */}
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={
          profile.profile_photo
            ? undefined
            : { background: getGradient(displayName) }
        }
      >
        {profile.profile_photo ? (
          <img
            src={profile.profile_photo}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white/80">
            {getInitials(displayName)}
          </div>
        )}

        {/* Completion badge */}
        <span className="absolute top-2 right-2 bg-campaign-soft text-campaign-dark text-[11px] font-semibold px-2 py-0.5 rounded-lg">
          {completion}%
        </span>

        {/* Select checkbox */}
        {selectable && (
          <div className="absolute top-2 left-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect?.();
              }}
              className="w-5 h-5 rounded border-white/50 bg-black/20 text-brand focus:ring-brand"
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-2.5">
        {/* Name + verified */}
        <div className="flex items-center gap-1 mb-0.5">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {displayName}
          </h3>
          {profile.is_verified && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-campaign shrink-0">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
            </span>
          )}
        </div>

        {/* Subtitle */}
        <p className="text-xs text-text-muted truncate mb-2">
          {profession}
          {profession && loc ? " · " : ""}
          {loc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {profile.professions?.slice(0, 2).map((p) => (
            <span
              key={p}
              className="px-1.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[10px] font-medium"
            >
              {p}
            </span>
          ))}
          {profile.languages?.slice(0, 1).map((l) => (
            <span
              key={l.name}
              className="px-1.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[10px] font-medium"
            >
              {l.name}
            </span>
          ))}
          {(profile.professions?.length ?? 0) > 2 && (
            <span className="px-1.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[10px] font-medium">
              +{(profile.professions!.length - 2)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile();
            }}
            className="w-full py-1.5 rounded-full border border-border bg-card text-text-secondary text-[11px] font-medium transition-colors hover:bg-muted-bg"
          >
            View Profile
          </button>
          <div className="flex gap-1.5">
            {onInvite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInvite();
                }}
                className="flex-1 py-1.5 rounded-full border border-campaign bg-campaign-light text-campaign text-[11px] font-medium transition-colors hover:bg-campaign-soft"
              >
                Invite
              </button>
            )}
            {onConnect && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConnect();
                }}
                className="flex-1 py-1.5 rounded-full border border-border bg-card text-text-secondary text-[11px] font-medium transition-colors hover:bg-muted-bg flex items-center justify-center gap-1"
              >
                <UserPlus className="w-3 h-3" strokeWidth={1.5} />
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
