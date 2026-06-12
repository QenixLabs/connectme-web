"use client";

import { Star, CheckCircle2, Pencil, LayoutGrid, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { ShareProfileDialog } from "@/components/share-profile-dialog";

function availabilityMeta(v?: string) {
  switch (v) {
    case "available":
      return {
        label: "Available",
        style: { background: "var(--color-success-light)", color: "var(--color-success-dark)", border: "0.5px solid var(--color-success-muted)" },
      };
    case "busy":
      return {
        label: "Busy",
        style: { background: "var(--color-msg-gold-soft)", color: "var(--color-campaign-dark)", border: "0.5px solid var(--color-border-gold)" },
      };
    case "not_available":
      return {
        label: "Not available",
        style: { background: "var(--color-error-light)", color: "var(--color-error)", border: "0.5px solid var(--color-error-muted)" },
      };
    default:
      return {
        label: "Unknown",
        style: { background: "var(--color-msg-cream)", color: "var(--color-msg-ink-soft)", border: "0.5px solid var(--color-border-warm)" },
      };
  }
}

function completenessMeta(pct?: number) {
  if (pct === undefined) return null;
  if (pct >= 80)
    return {
      label: "Excellent",
      style: { background: "var(--color-success-light)", color: "var(--color-success-dark)", border: "0.5px solid var(--color-success-muted)" },
      showStar: true,
    };
  if (pct >= 60)
    return {
      label: "Advanced",
      style: { background: "var(--color-success-light)", color: "var(--color-success-dark)", border: "0.5px solid var(--color-success-muted)" },
      showStar: false,
    };
  if (pct >= 40)
    return {
      label: "Intermediate",
      style: { background: "var(--color-msg-gold-soft)", color: "var(--color-campaign-dark)", border: "0.5px solid var(--color-border-gold)" },
      showStar: false,
    };
  if (pct >= 20)
    return {
      label: "Beginner",
      style: { background: "var(--color-msg-cream)", color: "var(--color-msg-ink-soft)", border: "0.5px solid var(--color-border-warm)" },
      showStar: false,
    };
  return {
    label: "Starter",
    style: { background: "var(--color-msg-cream)", color: "var(--color-msg-ink-soft)", border: "0.5px solid var(--color-border-warm)" },
    showStar: false,
  };
}

export interface ProfileCardProps {
  profile: TalentProfile;
  completeness?: number;
  verificationTier?: number;
  onEdit?: () => void;
  onPortfolio?: () => void;
}

export function ProfileCard({
  profile,
  completeness,
  verificationTier,
  onEdit,
  onPortfolio,
}: ProfileCardProps) {
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const avail = availabilityMeta(profile.availability);
  const comp = completenessMeta(completeness);
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      className="bg-white overflow-hidden"
      style={{ borderRadius: "16px", border: "0.5px solid var(--color-msg-border)" }}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {profile.profile_photo ? (
            <img
              src={profile.profile_photo}
              alt=""
              className="w-[52px] h-[52px] rounded-full object-cover"
            />
          ) : (
            <div
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white text-[18px] font-bold"
              style={{
                background: "linear-gradient(135deg, var(--color-gold-warm), var(--color-gold-dark))",
                fontFamily: "var(--font-playfair), Georgia, serif",
              }}
            >
              {initials}
            </div>
          )}
          {(verificationTier ?? 0) >= 2 && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white"
              style={{ background: "var(--color-msg-gold)" }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h1
              className="text-[16px] font-semibold text-msg-ink truncate leading-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {displayName}
            </h1>
            {(verificationTier ?? 0) >= 2 && (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-msg-gold" strokeWidth={1.5} />
            )}
          </div>
          {profile.username && (
            <p className="text-[12px] text-msg-ink-muted">@{profile.username}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={avail.style}
            >
              {avail.label}
            </span>
            {comp && (
              <span
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={comp.style}
              >
                {comp.showStar && <Star className="w-3 h-3" strokeWidth={1.5} />}
                {comp.label}
              </span>
            )}
            {profile.professions?.slice(0, 1).map((p) => (
              <span
                key={p}
                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: "var(--color-msg-cream)", color: "var(--color-msg-ink-soft)", border: "0.5px solid var(--color-border-warm)" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-4">
        <button
          onClick={onPortfolio}
          className="h-[34px] rounded-[10px] flex items-center justify-center gap-1.5 text-[12px] font-medium text-msg-ink-soft transition-colors"
          style={{ background: "var(--color-cream-soft)", border: "0.5px solid var(--color-msg-border)" }}
        >
          <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
          Portfolio
        </button>
        <button
          onClick={onEdit}
          className="h-[34px] rounded-[10px] flex items-center justify-center gap-1.5 text-[12px] font-medium transition-colors"
          style={{ background: "var(--color-msg-ink)", color: "var(--color-cream-hover)", border: "0.5px solid var(--color-msg-ink)" }}
        >
          <Pencil className="w-4 h-4" strokeWidth={1.5} />
          {completeness !== undefined && completeness < 100 ? "Complete" : "Edit"}
        </button>
        <ShareProfileDialog
          username={profile.username}
          profilePhoto={profile.profile_photo}
          name={profile.full_legal_name}
        >
          <button
            className="h-[34px] rounded-[10px] flex items-center justify-center gap-1.5 text-[12px] font-medium text-msg-ink-soft transition-colors w-full"
            style={{ background: "var(--color-cream-soft)", border: "0.5px solid var(--color-msg-border)" }}
          >
            <Share2 className="w-4 h-4" strokeWidth={1.5} />
            Share
          </button>
        </ShareProfileDialog>
      </div>
    </div>
  );
}
