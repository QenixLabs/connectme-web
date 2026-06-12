"use client";

import { Check, MapPin, Briefcase, UserPlus } from "lucide-react";
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
  access_status?: "allowed" | "pending" | "none";
  is_verified?: boolean;
  gender?: string;
}>;

interface TalentListRowProps {
  profile: ProfileWithAccess;
  onViewProfile: () => void;
  onInvite?: () => void;
  onConnect?: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

function availabilityColor(avail?: string): string {
  switch (avail) {
    case "available":
      return "bg-green-100 text-green-700";
    case "busy":
      return "bg-amber-100 text-amber-700";
    case "not_available":
      return "bg-red-100 text-red-700";
    default:
      return "bg-muted-bg text-text-muted";
  }
}

export function TalentListRow({
  profile,
  onViewProfile,
  onInvite,
  onConnect,
  selectable,
  isSelected,
  onToggleSelect,
}: TalentListRowProps) {
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const loc = [profile.location?.city, profile.location?.state]
    .filter(Boolean)
    .join(", ");
  const profession = profile.professions?.[0] ?? profile.industries?.[0] ?? "";

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border border-border bg-card transition-all duration-200",
        selectable && "cursor-pointer",
        isSelected && "border-brand ring-1 ring-brand",
        !selectable && "hover:shadow-sm",
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
      {/* Select checkbox */}
      {selectable && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect?.();
          }}
          className="w-5 h-5 rounded border-border bg-card text-brand focus:ring-brand shrink-0"
        />
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {displayName}
          </h3>
          {profile.is_verified && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-campaign shrink-0">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
            </span>
          )}
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
              availabilityColor(profile.availability),
            )}
          >
            {profile.availability
              ? profile.availability.replace("_", " ")
              : "Unknown"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-2xs text-text-muted">
          {profession && (
            <span className="flex items-center gap-0.5 truncate">
              <Briefcase className="w-3 h-3" strokeWidth={1.5} />
              {profession}
            </span>
          )}
          {loc && (
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3" strokeWidth={1.5} />
              {loc}
            </span>
          )}
        </div>

        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {profile.skills.slice(0, 3).map((s) => (
              <span
                key={s.name}
                className="px-1.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[10px] font-medium"
              >
                {s.name}
              </span>
            ))}
            {profile.skills.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[10px] font-medium">
                +{profile.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile();
          }}
          className="h-8 px-3 rounded-lg border border-border bg-card text-text-secondary text-xs font-medium transition-colors hover:bg-muted-bg"
        >
          View
        </button>
        {onInvite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInvite();
            }}
            className="h-8 px-3 rounded-lg border border-campaign bg-campaign-light text-campaign text-xs font-medium transition-colors hover:bg-campaign-soft"
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
            className="h-8 px-3 rounded-lg border border-border bg-card text-text-secondary text-xs font-medium transition-colors hover:bg-muted-bg flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
