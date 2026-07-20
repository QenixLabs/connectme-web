"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Check, BookmarkCheck, ClipboardList, MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrichedApplication } from "../campaign-application-card";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  const hues = [
    [25, 45], [35, 55], [200, 220], [150, 170],
    [280, 300], [10, 25], [180, 200], [320, 340],
  ];
  const pair = hues[hash % hues.length];
  const h1 = pair[0] + (hash % 15);
  const h2 = pair[1] + (hash % 15);
  return `linear-gradient(135deg, hsl(${h1}, 35%, 65%), hsl(${h2}, 40%, 45%))`;
}

interface ApplicantKanbanCardProps {
  application: EnrichedApplication;
  columnId: string;
  onViewProfile: () => void;
  onViewPreview: () => void;
  onStatusChange: (status: string) => void;
  onToggleShortlist: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function ApplicantKanbanCard({
  application,
  columnId,
  onViewProfile,
  onViewPreview,
  onStatusChange,
  onToggleShortlist,
  selectable,
  isSelected,
  onToggleSelect,
}: ApplicantKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: application._id,
      data: { application, fromColumn: columnId },
    });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const talent =
    typeof application.talent_id === "object" && application.talent_id !== null
      ? application.talent_id
      : null;

  const profile = application.talent_profile;
  const displayName = talent?.full_legal_name || talent?.email || "Unknown";
  const profilePhoto = profile?.profile_photo;
  const professions = profile?.professions || [];
  const primaryProfession = professions[0] ?? "";
  const isVerified = profile?.is_verified ?? false;
  const note = application.note;
  const hasNote = note && (note.note_text || (note.rating && note.rating > 0));
  const hasSubmission = !!application.task_submission_status &&
    application.task_submission_status !== "assigned";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-card border border-border/60 rounded-xl overflow-hidden transition-all duration-200",
        isDragging && "opacity-50 shadow-lg z-50",
        !isDragging && "hover:shadow-md hover:border-border",
        isSelected && "border-brand ring-1 ring-brand",
      )}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button, a, input, [role='button']")) return;
        if (selectable) {
          onToggleSelect?.();
        } else {
          onViewPreview();
        }
      }}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1.5 left-1.5 z-10 w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-black/10 hover:bg-black/20"
      >
        <GripVertical className="w-3.5 h-3.5 text-white" strokeWidth={2} />
      </div>

      {/* Photo */}
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={profilePhoto ? undefined : { background: getGradient(displayName) }}
      >
        {profilePhoto ? (
          <img
            src={profilePhoto}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/80">
            {getInitials(displayName)}
          </div>
        )}

        {/* Match badge */}
        <span className="absolute top-1 right-1 text-[9px] font-bold px-1 py-0.5 rounded bg-brand/90 text-white backdrop-blur-sm">
          {application.match_score}%
        </span>

        {/* Select checkbox */}
        {selectable && (
          <div className="absolute bottom-1.5 left-1.5 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect?.();
              }}
              className="w-4 h-4 rounded border-white/60 bg-black/20 text-brand focus:ring-brand"
            />
          </div>
        )}

        {/* Shortlist indicator */}
        {application.is_shortlisted && (
          <span className="absolute bottom-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-amber-400/90 text-white shadow-sm">
            <BookmarkCheck className="w-3 h-3" strokeWidth={2} />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <div className="flex items-center gap-1 mb-0">
          <h3 className="text-xs font-semibold text-text-primary truncate flex-1">
            {displayName}
          </h3>
          {isVerified && (
            <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-campaign shrink-0">
              <Check className="w-1.5 h-1.5 text-white" strokeWidth={2.5} />
            </span>
          )}
        </div>
        <p className="text-[10px] text-text-muted truncate mb-1.5">
          {primaryProfession}
        </p>

        {/* Quick action indicators */}
        <div className="flex items-center gap-1 mb-0.5">
          {hasNote && (
            <span className="flex items-center gap-0.5 text-amber-600">
              <Star className="w-2 h-2 fill-amber-400" strokeWidth={0} />
              <span className="text-[9px] font-medium">{note.rating || ""}</span>
            </span>
          )}
          {hasSubmission && (
            <span className={cn(
              "px-1 py-0.5 rounded text-[9px] font-semibold",
              application.task_submission_status === "submitted"
                ? "bg-blue-50 text-blue-600"
                : "bg-emerald-50 text-emerald-600",
            )}>
              <ClipboardList className="w-2 h-2 inline mr-0.5" strokeWidth={1.5} />
              {application.task_submission_status === "submitted" ? "New" : "Reviewed"}
            </span>
          )}
        </div>
      </div>

      {/* Hover actions overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1.5 pointer-events-none group-hover:pointer-events-auto">
        <button
          onClick={(e) => { e.stopPropagation(); onViewPreview(); }}
          className="w-full py-1.5 rounded-lg bg-white/90 text-ink text-[10px] font-semibold backdrop-blur-sm hover:bg-white transition-colors"
        >
          Quick View
        </button>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleShortlist(); }}
            className={cn(
              "flex-1 py-1 rounded-lg text-[9px] font-semibold backdrop-blur-sm transition-colors",
              application.is_shortlisted
                ? "bg-amber-400/90 text-amber-900"
                : "bg-white/60 text-white hover:bg-white/80",
            )}
          >
            {application.is_shortlisted ? "Shortlisted" : "Shortlist"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
            className="flex-1 py-1 rounded-lg bg-white/60 text-white text-[9px] font-semibold backdrop-blur-sm hover:bg-white/80 transition-colors"
          >
            Profile
          </button>
        </div>
        <div className="flex gap-1">
          {application.status !== "accepted" && (
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange("accepted"); }}
              className="flex-1 py-1 rounded-lg bg-emerald-500/90 text-white text-[9px] font-semibold backdrop-blur-sm hover:bg-emerald-500 transition-colors"
            >
              Accept
            </button>
          )}
          {application.status !== "rejected" && (
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange("rejected"); }}
              className="flex-1 py-1 rounded-lg bg-rose-500/90 text-white text-[9px] font-semibold backdrop-blur-sm hover:bg-rose-500 transition-colors"
            >
              Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
