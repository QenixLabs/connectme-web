"use client";

import {
  Check,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  BookmarkCheck,
  Bookmark,
  MessageSquare,
  Star,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrichedApplication } from "./campaign-application-card";

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

interface CampaignApplicationRowProps {
  application: EnrichedApplication;
  onViewProfile: () => void;
  onStatusChange: (status: string) => void;
  onToggleShortlist: () => void;
  onAddNote: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function CampaignApplicationRow({
  application,
  onViewProfile,
  onStatusChange,
  onToggleShortlist,
  onAddNote,
  selectable,
  isSelected,
  onToggleSelect,
}: CampaignApplicationRowProps) {
  const talent =
    typeof application.talent_id === "object" && application.talent_id !== null
      ? application.talent_id
      : null;

  const profile = application.talent_profile;
  const displayName = talent?.full_legal_name || talent?.email || "Unknown";
  const profilePhoto = profile?.profile_photo;
  const professions = profile?.professions || [];
  const location = profile?.location;
  const loc = [location?.city, location?.state].filter(Boolean).join(", ");
  const primaryProfession = professions[0] ?? "";
  const isVerified = profile?.is_verified ?? false;
  const meta = STATUS_META[application.status] ?? STATUS_META.pending;
  const StatusIcon = meta.icon;
  const note = application.note;
  const hasNote = note && (note.note_text || (note.rating && note.rating > 0));

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border border-border bg-card transition-all duration-200",
        selectable && "cursor-pointer",
        isSelected && "border-brand ring-1 ring-brand",
        !selectable && "hover:shadow-sm"
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

      {/* Avatar */}
      <div className="shrink-0">
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={displayName}
            className="w-10 h-10 rounded-xl object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <span className="text-sm font-semibold text-slate-500">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        {/* Match + status row */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="px-1.5 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold">
            {application.match_score}% match
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
              meta.classes
            )}
          >
            {meta.label}
          </span>
          {application.is_shortlisted && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-0.5">
              <BookmarkCheck className="w-2.5 h-2.5" strokeWidth={2} />
              Shortlisted
            </span>
          )}
          {hasNote && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400" strokeWidth={0} />
              {note.rating && note.rating > 0 ? note.rating : "Note"}
            </span>
          )}
          {application.task_submission_status && (
            <span className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border flex items-center gap-0.5",
              application.task_submission_status === "submitted"
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : application.task_submission_status === "reviewed"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
            )}>
              <ClipboardList className="w-2.5 h-2.5" strokeWidth={1.5} />
              {application.task_submission_status === "assigned" ? "Task Assigned" :
               application.task_submission_status === "submitted" ? "Task Submitted" :
               application.task_submission_status === "reviewed" ? "Task Reviewed" :
               application.task_submission_status}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {displayName}
          </h3>
          {isVerified && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-campaign shrink-0">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-2xs text-text-muted">
          {primaryProfession && (
            <span className="flex items-center gap-0.5 truncate">
              <Briefcase className="w-3 h-3" strokeWidth={1.5} />
              {primaryProfession}
            </span>
          )}
          {loc && (
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3" strokeWidth={1.5} />
              {loc}
            </span>
          )}
          <span className="text-text-muted/60">
            Applied{" "}
            {new Date(application.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile();
          }}
          className="h-8 px-3 rounded-lg border border-border bg-card text-text-secondary text-xs font-medium transition-colors hover:bg-muted-bg"
        >
          View
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleShortlist();
          }}
          className={cn(
            "h-8 px-3 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1",
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
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddNote();
          }}
          className={cn(
            "h-8 px-3 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1",
            hasNote
              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-border bg-card text-text-secondary hover:bg-muted-bg"
          )}
        >
          <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
        </button>
        {application.status !== "accepted" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange("accepted");
            }}
            className="h-8 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium transition-colors hover:bg-emerald-100 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
          </button>
        )}
        {application.status !== "rejected" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange("rejected");
            }}
            className="h-8 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium transition-colors hover:bg-rose-100 flex items-center gap-1"
          >
            <XCircle className="w-3 h-3" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}
