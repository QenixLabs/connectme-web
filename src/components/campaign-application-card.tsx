"use client";

import { Check, MessageSquare, Star, Clock, CheckCircle2, XCircle, BookmarkCheck, Bookmark, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskSubmission } from "@/lib/api";

type ApplicationTalent = {
  _id?: string;
  email?: string;
  full_legal_name?: string;
  username?: string;
  profile_photo?: string;
  professions?: string[];
  location?: { country?: string; state?: string; city?: string };
  availability?: string;
  specialties?: string[];
  languages?: Array<{ name?: string; fluency?: string }>;
  is_verified?: boolean;
};

type ApplicationNote = {
  _id: string;
  note_text?: string;
  rating?: number;
};

export interface EnrichedApplication {
  _id: string;
  campaign_id: string;
  talent_id: ApplicationTalent | string;
  talent_profile?: {
    full_legal_name?: string;
    username?: string;
    profile_photo?: string;
    professions?: string[];
    location?: { country?: string; state?: string; city?: string };
    availability?: string;
    specialties?: string[];
    languages?: Array<{ name?: string; fluency?: string }>;
    is_verified?: boolean;
  } | null;
  message?: string;
  status: string;
  created_at: string;
  match_score: number;
  answers?: Array<{ question_id: string; question_text: string; answer: string }>;
  is_shortlisted?: boolean;
  note?: ApplicationNote | null;
  task_submission_status?: string;
  task_submission?: TaskSubmission | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
    [25, 45],
    [35, 55],
    [200, 220],
    [150, 170],
    [280, 300],
    [10, 25],
    [180, 200],
    [320, 340],
  ];
  const pair = hues[seed % hues.length];
  const h1 = pair[0] + (seed % 15);
  const h2 = pair[1] + (seed % 15);
  return `linear-gradient(135deg, hsl(${h1}, 35%, 65%), hsl(${h2}, 40%, 45%))`;
}

const STATUS_META: Record<
  string,
  { label: string; icon: typeof CheckCircle2; classes: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    classes: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

interface CampaignApplicationCardProps {
  application: EnrichedApplication;
  onViewProfile: () => void;
  onStatusChange: (status: string) => void;
  onToggleShortlist: () => void;
  onAddNote: () => void;
  onViewSubmission?: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function CampaignApplicationCard({
  application,
  onViewProfile,
  onStatusChange,
  onToggleShortlist,
  onAddNote,
  onViewSubmission,
  selectable,
  isSelected,
  onToggleSelect,
}: CampaignApplicationCardProps) {
  const talent =
    typeof application.talent_id === "object" && application.talent_id !== null
      ? application.talent_id
      : null;

  const profile = application.talent_profile;
  const displayName = profile?.full_legal_name || talent?.full_legal_name || talent?.email || "Unknown";
  const profilePhoto = profile?.profile_photo;
  const professions = profile?.professions || [];
  const location = profile?.location;
  const loc = location?.city || location?.state || "";
  const primaryProfession = professions[0] ?? "";
  const isVerified = profile?.is_verified ?? false;
  const meta = STATUS_META[application.status] ?? STATUS_META.pending;
  const StatusIcon = meta.icon;
  const note = application.note;
  const hasNote = note && (note.note_text || (note.rating && note.rating > 0));

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
          profilePhoto ? undefined : { background: getGradient(displayName) }
        }
      >
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white/80">
            {getInitials(displayName)}
          </div>
        )}

        {/* Match score badge */}
        <span className="absolute top-2 right-2 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-brand/90 text-white">
          {application.match_score}%
        </span>

        {/* Status badge */}
        <span
          className={cn(
            "absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-lg border",
            meta.classes
          )}
        >
          {meta.label}
        </span>

        {/* Select checkbox */}
        {selectable && (
          <div className="absolute bottom-2 left-2">
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

        {/* Shortlist indicator */}
        {application.is_shortlisted && (
          <span className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-amber-400/90 text-white">
            <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={2} />
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-2.5">
        {/* Match badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-1.5 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold">
            {application.match_score}% match
          </span>
          {hasNote && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400" strokeWidth={0} />
              {note.rating && note.rating > 0 ? note.rating : "Note"}
            </span>
          )}
          {application.task_submission_status && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewSubmission?.();
              }}
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 cursor-pointer hover:scale-[1.04] transition-transform",
                application.task_submission_status === "submitted"
                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  : application.task_submission_status === "reviewed"
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <ClipboardList className="w-2.5 h-2.5" strokeWidth={1.5} />
              {application.task_submission_status === "assigned" ? "Task Assigned" :
               application.task_submission_status === "submitted" ? "Task Submitted" :
               application.task_submission_status === "reviewed" ? "Task Reviewed" :
               application.task_submission_status}
            </button>
          )}
        </div>

        {/* Name + verified */}
        <div className="flex items-center gap-1 mb-0.5">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {displayName}
          </h3>
          {isVerified && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-campaign shrink-0">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
            </span>
          )}
        </div>

        {/* Subtitle */}
        <p className="text-xs text-text-muted truncate mb-2">
          {primaryProfession}
          {primaryProfession && loc ? " · " : ""}
          {loc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {professions.slice(0, 2).map((p) => (
            <span
              key={p}
              className="px-1.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[10px] font-medium"
            >
              {p}
            </span>
          ))}
          {profile?.languages?.slice(0, 1).map((l) => (
            <span
              key={l.name}
              className="px-1.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[10px] font-medium"
            >
              {l.name}
            </span>
          ))}
          {professions.length > 2 && (
            <span className="px-1.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[10px] font-medium">
              +{professions.length - 2}
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleShortlist();
              }}
              className={cn(
                "flex-1 py-1.5 rounded-full border text-[11px] font-medium transition-colors flex items-center justify-center gap-1",
                application.is_shortlisted
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "border-border bg-card text-text-secondary hover:bg-muted-bg"
              )}
            >
              {application.is_shortlisted ? (
                <BookmarkCheck className="w-3 h-3" strokeWidth={1.5} />
              ) : (
                <Bookmark className="w-3 h-3" strokeWidth={1.5} />
              )}
              {application.is_shortlisted ? "Shortlisted" : "Shortlist"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddNote();
              }}
              className={cn(
                "flex-1 py-1.5 rounded-full border text-[11px] font-medium transition-colors flex items-center justify-center gap-1",
                hasNote
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "border-border bg-card text-text-secondary hover:bg-muted-bg"
              )}
            >
              <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
              {hasNote ? "Note" : "Note"}
            </button>
          </div>
          <div className="flex gap-1.5">
            {application.status !== "accepted" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange("accepted");
                }}
                className="flex-1 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-medium transition-colors hover:bg-emerald-100 flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                Accept
              </button>
            )}
            {application.status !== "rejected" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange("rejected");
                }}
                className="flex-1 py-1.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-[11px] font-medium transition-colors hover:bg-rose-100 flex items-center justify-center gap-1"
              >
                <XCircle className="w-3 h-3" strokeWidth={1.5} />
                Reject
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
