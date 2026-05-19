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

interface TalentListItemProps {
  profile: ProfileWithAccess;
  onViewProfile: () => void;
  onViewPortfolio: () => void;
  onContact: () => void;
  onInvite?: () => void;
}

export function TalentListItem({
  profile,
  onViewProfile,
  onViewPortfolio,
  onContact,
  onInvite,
}: TalentListItemProps) {
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
    <article className="bg-card border border-border rounded-2xl p-3 sm:p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(79,110,247,0.12),0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex gap-3 sm:gap-3.5 items-start">
        <Avatar
          name={displayName}
          src={profile.profile_photo}
          className="w-12 h-12 sm:w-[60px] sm:h-[60px] md:w-[72px] md:h-[72px] text-lg sm:text-xl shrink-0 border-2 border-border"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-text-primary leading-tight break-words">
              {displayName}
            </span>
            {profile.is_verified && (
              <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-amber-500 shrink-0">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
              </span>
            )}
            {profile.privacy_mode === "private" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
                <Lock className="w-3 h-3" strokeWidth={1.5} />
                Private
              </span>
            )}
          </div>
          {profile.username && (
            <div className="text-[11px] sm:text-xs text-text-tertiary mt-px font-mono break-all">
              @{profile.username}
            </div>
          )}
          {profile.headline && (
            <p className="text-xs sm:text-[13px] text-text-secondary mt-1 line-clamp-2 leading-[1.45]">
              {profile.headline}
            </p>
          )}
          {loc && (
            <div className="flex items-center gap-1 mt-1 text-[11px] sm:text-xs text-text-muted min-w-0">
              <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{loc}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 items-center">
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
            avail.classes,
          )}
        >
          {avail.label}
        </span>
        {profile.professions?.map((p) => (
          <span
            key={p}
            className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[11px] sm:text-xs font-medium"
          >
            {p}
          </span>
        ))}
      </div>

      {isPrivateLocked ? (
        <div className="mt-3 sm:mt-3.5 flex items-center gap-2">
          {isPending ? (
            <button
              disabled
              className="flex-1 min-h-10 sm:min-h-11 rounded-[10px] border-[1.5px] border-border bg-muted-bg text-text-muted text-[13px] font-medium flex items-center justify-center gap-1.5 cursor-not-allowed"
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
              className="flex-1 min-h-10 sm:min-h-11 rounded-[10px] border-[1.5px] border-amber-500 bg-amber-50 text-amber-700 text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-[15px] h-[15px]" strokeWidth={1.5} />
              Request Access
            </button>
          )}
          <button
            onClick={onViewProfile}
            className="min-h-10 sm:min-h-11 px-4 rounded-[10px] border-[1.5px] border-border bg-card text-text-secondary text-[13px] font-medium flex items-center gap-1.5 transition-colors hover:border-brand hover:text-brand hover:bg-brand-light whitespace-nowrap"
          >
            View Profile
          </button>
        </div>
      ) : (
        <>
          <div className="mt-3 sm:mt-3.5 flex items-center gap-2">
            <button
              onClick={onViewPortfolio}
              className="flex-1 min-h-10 sm:min-h-11 rounded-[10px] border-[1.5px] border-border bg-card text-text-secondary text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors hover:border-brand hover:text-brand hover:bg-brand-light"
            >
              <Images className="w-[15px] h-[15px]" strokeWidth={1.5} />
              Portfolio
            </button>
            <button
              onClick={onContact}
              className="min-h-10 sm:min-h-11 px-4 rounded-[10px] bg-brand text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors hover:bg-brand-hover whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
              Contact
            </button>
            {onInvite && (
              <button
                onClick={onInvite}
                className="min-h-10 sm:min-h-11 px-4 rounded-[10px] border-[1.5px] border-brand bg-brand-light text-brand text-[13px] font-medium flex items-center gap-1.5 transition-colors hover:bg-brand hover:text-white whitespace-nowrap"
              >
                <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                Invite
              </button>
            )}
          </div>
          <button
            onClick={onViewProfile}
            className="mt-2 sm:mt-2.5 w-full min-h-9 flex items-center justify-center gap-1 text-xs font-medium text-text-muted rounded-lg py-1 transition-colors hover:text-text-secondary hover:bg-muted-bg"
          >
            View full profile
            <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </>
      )}
    </article>
  );
}
