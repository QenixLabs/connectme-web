"use client";

import { CheckCircle2, Pencil, LayoutGrid, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { ShareProfileDialog } from "@/components/share-profile-dialog";

function availabilityClass(v?: string) {
  switch (v) {
    case "available":
      return "bg-success-light text-success-text border-success-muted";
    case "busy":
      return "bg-gold-soft text-gold-ink border-gold/30";
    case "not_available":
      return "bg-error-light text-error-text border-error-muted";
    default:
      return "bg-cream text-ink-soft border-border";
  }
}

function completenessClass(pct?: number) {
  if (pct === undefined) return { cls: "bg-cream text-ink-soft border-border", label: "Starter", showStar: false };
  if (pct >= 80) return { cls: "bg-success-light text-success-text border-success-muted", label: "Excellent", showStar: true };
  if (pct >= 60) return { cls: "bg-success-light text-success-text border-success-muted", label: "Advanced", showStar: false };
  if (pct >= 40) return { cls: "bg-gold-soft text-gold-ink border-gold/30", label: "Intermediate", showStar: false };
  if (pct >= 20) return { cls: "bg-cream text-ink-soft border-border", label: "Beginner", showStar: false };
  return { cls: "bg-cream text-ink-soft border-border", label: "Starter", showStar: false };
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
  const isVerified = (verificationTier ?? 0) >= 2;
  const availCls = availabilityClass(profile.availability);
  const comp = completenessClass(completeness);
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <Card className="rounded-2xl border-border overflow-hidden p-0 gap-0">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="relative shrink-0">
          {profile.profile_photo ? (
            <img src={profile.profile_photo} alt="" className="w-[52px] h-[52px] rounded-full object-cover" />
          ) : (
            <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white text-[18px] font-bold bg-gradient-to-br from-gold-warm to-gold-dark font-serif">
              {initials}
            </div>
          )}
          {isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white bg-gold">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h1 className="text-[16px] font-semibold text-ink truncate leading-tight font-serif">
              {displayName}
            </h1>
            {isVerified && <CheckCircle2 className="w-4 h-4 shrink-0 text-gold" strokeWidth={1.5} />}
          </div>
          {profile.username && <p className="text-[12px] text-ink-muted">@{profile.username}</p>}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium border", availCls)}>
              {profile.availability || "Unknown"}
            </span>
            <span className={cn("inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border", comp.cls)}>
              {comp.label}
            </span>
            {profile.professions?.slice(0, 1).map((p) => (
              <span key={p} className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-cream text-ink-soft border border-border">
                {p}
              </span>
            ))}
          </div>
        </div>
      </CardContent>

      <CardContent className="p-0 grid grid-cols-3 gap-2 px-4 pb-4">
        <button
          onClick={onPortfolio}
          className="h-[34px] rounded-[10px] flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink-soft bg-cream-soft border border-border transition-colors hover:bg-cream-hover"
        >
          <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
          Portfolio
        </button>
        <button
          onClick={onEdit}
          className="h-[34px] rounded-[10px] flex items-center justify-center gap-1.5 text-[12px] font-medium text-white bg-ink border border-ink transition-colors"
        >
          <Pencil className="w-4 h-4" strokeWidth={1.5} />
          {completeness !== undefined && completeness < 100 ? "Complete" : "Edit"}
        </button>
        <ShareProfileDialog
          username={profile.username}
          profilePhoto={profile.profile_photo}
          name={profile.full_legal_name}
        >
          <button className="h-[34px] rounded-[10px] flex items-center justify-center gap-1.5 text-[12px] font-medium text-ink-soft bg-cream-soft border border-border transition-colors hover:bg-cream-hover w-full">
            <Share2 className="w-4 h-4" strokeWidth={1.5} />
            Share
          </button>
        </ShareProfileDialog>
      </CardContent>
    </Card>
  );
}
