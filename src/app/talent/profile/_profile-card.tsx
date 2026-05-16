"use client";

import { useState } from "react";
import { Eye, Bookmark, Globe, Star, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

export function ShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    const url = `${window.location.origin}/talent/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };
  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-1.5 py-3 rounded-lg text-xs font-medium bg-muted-bg text-text-primary border border-border hover:bg-muted-bg/80 transition-colors"
    >
      <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

function VerificationBadge() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#f59e0b"
      width="16"
      height="16"
      className="inline-block shrink-0"
    >
      <path d="M12 2l1.9 2.1 2.8-.5.7 2.8 2.6 1.1-.6 2.8 1.8 2.2-1.8 2.2.6 2.8-2.6 1.1-.7 2.8-2.8-.5L12 22l-1.9-2.1-2.8.5-.7-2.8-2.6-1.1.6-2.8-1.8-2.2 1.8-2.2-.6-2.8 2.6-1.1.7-2.8 2.8.5z" />
      <path d="M9.5 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4z" fill="#ffffff" />
    </svg>
  );
}

function formatCount(n?: number): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function availabilityMeta(v?: string) {
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

function completenessMeta(pct?: number) {
  if (pct === undefined) return null;
  if (pct >= 80)
    return { label: "Excellent", classes: "bg-brand-light text-brand-hover border-brand-muted" };
  if (pct >= 60)
    return { label: "Advanced", classes: "bg-success-light text-success-text border-success-muted" };
  if (pct >= 40)
    return { label: "Intermediate", classes: "bg-brand-soft text-brand-hover border-brand-muted" };
  if (pct >= 20)
    return { label: "Beginner", classes: "bg-muted-bg text-text-secondary border-border" };
  return { label: "Starter", classes: "bg-muted-bg text-text-muted border-border" };
}

export interface ProfileCardProps {
  profile: TalentProfile;
  actions?: React.ReactNode;
  stats?: { icon: React.ElementType; value: string; label: string }[];
  completeness?: number;
}

export function ProfileCard({ profile, actions, stats, completeness }: ProfileCardProps) {
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const avail = availabilityMeta(profile.availability);
  const comp = completenessMeta(completeness);

  const defaultStats = (() => {
    const analytics = profile.analytics as
      | { profile_views_30d?: number; shortlist_count?: number }
      | undefined;
    const socialCount = [
      profile.social_links?.instagram?.url,
      profile.social_links?.youtube?.url,
      profile.social_links?.linkedin?.url,
    ].filter(Boolean).length;
    return [
      { icon: Eye, value: formatCount(analytics?.profile_views_30d), label: "Monthly Views" },
      { icon: Bookmark, value: formatCount(analytics?.shortlist_count), label: "Shortlists" },
      { icon: Globe, value: String(socialCount), label: "Social Links" },
    ];
  })();

  const statItems = stats ?? defaultStats;

  return (
    <>
      {/* Cover */}
      <div className="h-28 sm:h-24 relative overflow-hidden bg-gradient-to-br from-[#FDF3E0] via-[#FEF9F0] to-[#FCEFD6] border-b border-brand-muted/50">
        <div className="absolute inset-0 [background:repeating-linear-gradient(45deg,transparent,transparent_18px,rgba(232,160,32,0.04)_18px,rgba(232,160,32,0.04)_19px)]" />
      </div>

      {/* Card */}
      <Card className="mx-3 sm:mx-4 -mt-7 relative border-border-subtle">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-3.5">
            <div className="relative shrink-0 -mt-8">
              <div className="w-16 h-16 rounded-full border-[3px] border-brand bg-gradient-to-br from-purple-300 to-blue-400 flex items-center justify-center overflow-hidden">
                {profile.profile_photo ? (
                  <img src={profile.profile_photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[22px] font-medium text-white">
                    {displayName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-card" />
            </div>

            <div className="flex-1 pt-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h2 className="text-[17px] font-medium text-text-primary break-words">{displayName}</h2>
                {comp && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${comp.classes}`}>
                    <Star className="w-2.5 h-2.5" strokeWidth={1.5} />
                    {comp.label}
                  </span>
                )}
              </div>
              {profile.username && (
                <p className="text-[13px] text-text-secondary mb-2 flex items-center gap-1">
                  @{profile.username}
                  {profile.is_verified && <VerificationBadge />}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-[11px] px-2 py-[3px] rounded-full border ${avail.classes}`}>
                  {avail.label}
                </span>
                {profile.professions?.slice(0, 2).map((p) => (
                  <span key={p} className="text-[11px] px-2 py-[3px] rounded-full border bg-muted-bg text-text-secondary border-border">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="grid grid-flow-col gap-2 mb-4" style={{ gridAutoColumns: "minmax(0, 1fr)" }}>
              {actions}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {statItems.map((s) => (
              <div key={s.label} className="bg-muted-bg rounded-lg py-3 text-center border-l-2 border-brand-muted">
                <s.icon className="w-4 h-4 mx-auto text-brand mb-1" strokeWidth={1.5} />
                <p className="text-xl font-medium text-text-primary leading-none">{s.value}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
