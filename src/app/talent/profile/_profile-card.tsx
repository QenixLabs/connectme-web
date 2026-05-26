"use client";

import { useState } from "react";
import { Share2, Star, CheckCircle2, Pencil, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

export function ShareButton({ username, className }: { username: string; className?: string }) {
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
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors",
        className
      )}
    >
      <Share2 className="w-4 h-4" strokeWidth={1.5} />
      {copied ? "Copied" : "Share"}
    </button>
  );
}

function availabilityMeta(v?: string) {
  switch (v) {
    case "available":
      return {
        label: "Available",
        style: { background: "#f0faf4", color: "#2a7a4b", border: "0.5px solid #a3d9b8" },
      };
    case "busy":
      return {
        label: "Busy",
        style: { background: "#fdf3dc", color: "#8a5e0a", border: "0.5px solid #e8c87a" },
      };
    case "not_available":
      return {
        label: "Not available",
        style: { background: "#fef2f2", color: "#b91c1c", border: "0.5px solid #fecaca" },
      };
    default:
      return {
        label: "Unknown",
        style: { background: "#f5f3ef", color: "#5c5145", border: "0.5px solid #ddd5c5" },
      };
  }
}

function completenessMeta(pct?: number) {
  if (pct === undefined) return null;
  if (pct >= 80)
    return {
      label: "Excellent",
      style: { background: "#f0faf4", color: "#2a7a4b", border: "0.5px solid #a3d9b8" },
      showStar: true,
    };
  if (pct >= 60)
    return {
      label: "Advanced",
      style: { background: "#f0faf4", color: "#2a7a4b", border: "0.5px solid #a3d9b8" },
      showStar: false,
    };
  if (pct >= 40)
    return {
      label: "Intermediate",
      style: { background: "#fdf3dc", color: "#8a5e0a", border: "0.5px solid #e8c87a" },
      showStar: false,
    };
  if (pct >= 20)
    return {
      label: "Beginner",
      style: { background: "#f5f3ef", color: "#5c5145", border: "0.5px solid #ddd5c5" },
      showStar: false,
    };
  return {
    label: "Starter",
    style: { background: "#f5f3ef", color: "#5c5145", border: "0.5px solid #ddd5c5" },
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
      style={{ borderRadius: "16px", border: "0.5px solid #e0d9ce" }}
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
                background: "linear-gradient(135deg, #c8a96e, #8b6914)",
                fontFamily: "var(--font-playfair), Georgia, serif",
              }}
            >
              {initials}
            </div>
          )}
          {(verificationTier ?? 0) >= 2 && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white"
              style={{ background: "#c8a040" }}
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
              className="text-[16px] font-semibold text-[#1e1a14] truncate leading-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {displayName}
            </h1>
            {(verificationTier ?? 0) >= 2 && (
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#c8a040" }} strokeWidth={1.5} />
            )}
          </div>
          {profile.username && (
            <p className="text-[12px] text-[#8a7d6b]">@{profile.username}</p>
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
                style={{ background: "#f5f3ef", color: "#5c5145", border: "0.5px solid #ddd5c5" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={onPortfolio}
          className="flex-1 h-[34px] rounded-[10px] flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#5c5145] transition-colors"
          style={{ background: "#f7f4ef", border: "0.5px solid #e0d9ce" }}
        >
          <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
          Portfolio
        </button>
        <button
          onClick={onEdit}
          className="flex-1 h-[34px] rounded-[10px] flex items-center justify-center gap-1.5 text-[12px] font-medium transition-colors"
          style={{ background: "#1e1a14", color: "#f0e8d4", border: "0.5px solid #1e1a14" }}
        >
          <Pencil className="w-4 h-4" strokeWidth={1.5} />
          {completeness !== undefined && completeness < 100 ? "Complete" : "Edit"}
        </button>
      </div>
    </div>
  );
}
