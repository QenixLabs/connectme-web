"use client";

import {
  MapPin,
  Check,
  Images,
  MessageSquare,
  ChevronDown,
  Lock,
  Clock,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useRequestProfileAccess } from "@/lib/api/hooks/useRequestProfileAccess";

type ProfileWithAccess = Partial<{
  username?: string;
  full_legal_name?: string;
  headline?: string;
  profile_photo?: string;
  location?: { country?: string; state?: string; city?: string };
  professions?: string[];
  industries?: string[];
  availability?: string;
  privacy_mode?: string;
  access_status?: "allowed" | "pending" | "none";
  is_verified?: boolean;
  gender?: string;
}>;

function availabilityMeta(v?: string | null) {
  switch (v) {
    case "available":
      return {
        label: "Available",
        classes: "bg-success-light text-success-text border-success-muted",
      };
    case "busy":
      return {
        label: "Busy",
        classes: "bg-brand-light text-brand-hover border-brand-muted",
      };
    case "not_available":
      return {
        label: "Not available",
        classes: "bg-error-light text-error-text border-error-muted",
      };
    default:
      return {
        label: "Unknown",
        classes: "bg-muted-bg text-text-secondary border-border",
      };
  }
}

interface TalentGridCardProps {
  profile: ProfileWithAccess;
  onViewProfile: () => void;
  onViewPortfolio: () => void;
  onContact: () => void;
  onInvite?: () => void;
}

export function TalentGridCard({
  profile,
  onViewProfile,
  onViewPortfolio,
  onContact,
  onInvite,
}: TalentGridCardProps) {
  const requestAccess = useRequestProfileAccess();
  const loc = [profile.location?.city, profile.location?.state, profile.location?.country]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");
  const avail = availabilityMeta(profile.availability);
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const isPrivateLocked =
    profile.privacy_mode === "private" && profile.access_status !== "allowed";
  const isPending = profile.access_status === "pending";

  return (
    <article className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(79,110,247,0.12),0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full">
      {/* Header: avatar + name */}
      <div className="flex flex-col items-center text-center">
        <Avatar
          name={displayName}
          src={profile.profile_photo}
          className="w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl shrink-0 border-2 border-border"
        />
        <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-sm sm:text-base font-bold text-text-primary leading-tight break-words">
            {displayName}
          </span>
          {profile.is_verified && (
            <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-amber-500 shrink-0">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
            </span>
          )}
        </div>
        {profile.username && (
          <div className="text-[11px] sm:text-xs text-text-tertiary mt-0.5 font-mono break-all">
            @{profile.username}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 flex-1 min-w-0">
        {profile.headline && (
          <p className="text-xs sm:text-[13px] text-text-secondary line-clamp-2 leading-[1.45] text-center">
            {profile.headline}
          </p>
        )}
        {loc && (
          <div className="flex items-center justify-center gap-1 mt-1.5 text-[11px] sm:text-xs text-text-muted min-w-0">
            <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{loc}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-1.5 items-center justify-center">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[11px] font-semibold border",
            avail.classes,
          )}
        >
          {avail.label}
        </span>
        {profile.professions?.slice(0, 3).map((p) => (
          <span
            key={p}
            className="px-2 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[11px] font-medium"
          >
            {p}
          </span>
        ))}
        {(profile.professions?.length ?? 0) > 3 && (
          <span className="px-2 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[11px] font-medium">
            +{(profile.professions!.length - 3)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-border-subtle flex flex-col gap-2">
        {isPrivateLocked ? (
          <>
            {isPending ? (
              <button
                disabled
                className="w-full min-h-10 rounded-[10px] border-[1.5px] border-border bg-muted-bg text-text-muted text-[13px] font-medium flex items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <Clock className="w-[15px] h-[15px]" strokeWidth={1.5} />
                Request Pending
              </button>
            ) : (
              <button
                onClick={() =>
                  profile.username && requestAccess.mutate(profile.username)
                }
                disabled={requestAccess.isPending || !profile.username}
                className="w-full min-h-10 rounded-[10px] border-[1.5px] border-amber-500 bg-amber-50 text-amber-700 text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-[15px] h-[15px]" strokeWidth={1.5} />
                Request Access
              </button>
            )}
            <button
              onClick={onViewProfile}
              className="w-full min-h-10 rounded-[10px] border-[1.5px] border-border bg-card text-text-secondary text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors hover:border-brand hover:text-brand hover:bg-brand-light"
            >
              View Profile
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onContact}
              className="w-full min-h-10 rounded-[10px] bg-brand text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-brand-hover"
            >
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
              Contact
            </button>
            {onInvite && (
              <button
                onClick={onInvite}
                className="w-full min-h-10 rounded-[10px] border-[1.5px] border-brand bg-brand-light text-brand text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors hover:bg-brand hover:text-white"
              >
                <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                Invite to Campaign
              </button>
            )}
            <button
              onClick={onViewPortfolio}
              className="w-full min-h-10 rounded-[10px] border-[1.5px] border-border bg-card text-text-secondary text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors hover:border-brand hover:text-brand hover:bg-brand-light"
            >
              <Images className="w-[15px] h-[15px]" strokeWidth={1.5} />
              Portfolio
            </button>
            <button
              onClick={onViewProfile}
              className="w-full min-h-9 flex items-center justify-center gap-1 text-xs font-medium text-text-muted rounded-lg py-1 transition-colors hover:text-text-secondary hover:bg-muted-bg"
            >
              View full profile
              <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
