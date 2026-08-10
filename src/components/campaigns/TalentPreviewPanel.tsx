"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  BookmarkCheck,
  Bookmark,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Star,
  MessageSquareText,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EnrichedApplication } from "../campaign-application-card";
import { TalentOverviewTab } from "./TalentOverviewTab";
import { ApplicationDetailTab } from "./ApplicationDetailTab";
import { SubmissionReviewTab } from "./SubmissionReviewTab";
import type { ReactNode } from "react";

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

interface TalentPreviewPanelProps {
  application: EnrichedApplication | null;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onToggleShortlist: () => void;
  onNoteSave: (noteText: string, rating: number) => void;
  onNoteDelete: () => void;
  onReviewSubmission: (notes: string, rating: number) => void;
  onAcceptFromSubmission: () => void;
  onRejectFromSubmission: () => void;
  isSavingNote?: boolean;
  isDeletingNote?: boolean;
  isReviewing?: boolean;
  isUpdatingStatus?: boolean;
  children?: ReactNode;
}

export function TalentPreviewPanel({
  application,
  onClose,
  onStatusChange,
  onToggleShortlist,
  onNoteSave,
  onNoteDelete,
  onReviewSubmission,
  onAcceptFromSubmission,
  onRejectFromSubmission,
  isSavingNote,
  isDeletingNote,
  isReviewing,
  isUpdatingStatus,
}: TalentPreviewPanelProps) {
  const router = useRouter();

  // Note form state
  const [noteText, setNoteText] = useState("");
  const [noteRating, setNoteRating] = useState(0);

  useEffect(() => {
    if (application) {
      setNoteText(application.note?.note_text || "");
      setNoteRating(application.note?.rating || 0);
    }
  }, [application]);

  if (!application) return null;

  const talent =
    typeof application.talent_id === "object" && application.talent_id !== null
      ? application.talent_id
      : null;

  const profile = application.talent_profile;
  const displayName = profile?.full_legal_name || talent?.full_legal_name || talent?.email || "Unknown";
  const profilePhoto = profile?.profile_photo;
  const professions = profile?.professions || [];
  const primaryProfession = professions[0] ?? "";
  const location = profile?.location;
  const loc = [location?.city, location?.state].filter(Boolean).join(", ");
  const username = profile?.username;
  const isVerified = profile?.is_verified ?? false;
  const note = application.note;
  const hasNote = note && (note.note_text || (note.rating && note.rating > 0));
  const subtask = application.task_submission;
  const hasSubmission = !!subtask && subtask.status !== "assigned";
  const needsReview = subtask?.status === "submitted";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b border-border/60">
        {/* Close + actions row */}
        <div className="flex items-center justify-between px-5 py-3">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted-bg transition-colors"
          >
            <X className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-2">
            {username && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-lg text-xs"
                onClick={() => router.push(`/talent/${username}`)}
              >
                <ExternalLink className="w-3 h-3 mr-1" strokeWidth={1.5} />
                Full Profile
              </Button>
            )}
          </div>
        </div>

        {/* Talent identity */}
        <div className="px-5 pb-4">
          <div className="flex gap-4">
            {/* Photo */}
            <div
              className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-luxe"
              style={profilePhoto ? undefined : { background: getGradient(displayName) }}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/80">
                  {getInitials(displayName)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-serif font-semibold text-ink truncate">
                  {displayName}
                </h2>
                {isVerified && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-campaign shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6l3 3 5-6" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-muted mt-0.5">
                {[primaryProfession, loc].filter(Boolean).join(" · ")}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold">
                  {application.match_score}% match
                </span>
                {needsReview && (
                  <Badge className="rounded-full text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                    New Submission
                  </Badge>
                )}
                {hasNote && (
                  <span className="flex items-center gap-0.5 text-amber-600 text-[10px] font-bold">
                    <Star className="w-2.5 h-2.5 fill-amber-400" strokeWidth={0} />
                    {note.rating || "Note"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions bar */}
        <div className="flex gap-2 px-5 pb-4">
          <button
            onClick={onToggleShortlist}
            className={cn(
              "flex-1 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
              application.is_shortlisted
                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-border/60 bg-card text-ink-muted hover:text-ink hover:border-border"
            )}
          >
            {application.is_shortlisted ? (
              <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
            ) : (
              <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
            {application.is_shortlisted ? "Shortlisted" : "Shortlist"}
          </button>
          {application.status !== "accepted" && (
            <button
              onClick={() => onStatusChange("accepted")}
              className="flex-1 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold transition-all hover:bg-emerald-100 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              Accept
            </button>
          )}
          {application.status !== "rejected" && (
            <button
              onClick={() => onStatusChange("rejected")}
              className="flex-1 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold transition-all hover:bg-rose-100 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              Reject
            </button>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 flex flex-col">
        <Tabs
          defaultValue={needsReview ? "submission" : "overview"}
          className="flex flex-col flex-1 min-h-0"
        >
          <TabsList className="shrink-0 grid grid-cols-4 mx-4 mt-3 bg-muted-bg/50 rounded-xl p-0.5">
            <TabsTrigger value="overview" className="rounded-lg text-[11px] font-semibold h-8 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="application" className="rounded-lg text-[11px] font-semibold h-8 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Application
            </TabsTrigger>
            <TabsTrigger
              value="submission"
              className="rounded-lg text-[11px] font-semibold h-8 data-[state=active]:bg-card data-[state=active]:shadow-sm relative"
            >
              Submission
              {needsReview && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="notes" className="rounded-lg text-[11px] font-semibold h-8 data-[state=active]:bg-card data-[state=active]:shadow-sm relative">
              Notes
              {hasNote && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 overflow-hidden" asChild>
            <ScrollArea className="h-full">
              <div className="px-5 pt-4 pb-8">
                <TalentOverviewTab application={application} />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Application Tab */}
          <TabsContent value="application" className="flex-1 overflow-hidden" asChild>
            <ScrollArea className="h-full">
              <div className="px-5 pt-4 pb-8">
                <ApplicationDetailTab application={application} />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Submission Tab */}
          <TabsContent value="submission" className="flex-1 overflow-hidden" asChild>
            <ScrollArea className="h-full">
              <div className="px-5 pt-4 pb-8">
                <SubmissionReviewTab
                  application={application}
                  onReview={onReviewSubmission}
                  onAccept={application.status !== "accepted" ? onAcceptFromSubmission : undefined}
                  onReject={application.status !== "rejected" ? onRejectFromSubmission : undefined}
                  isReviewing={isReviewing}
                  isUpdatingStatus={isUpdatingStatus}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="flex-1 overflow-hidden" asChild>
            <ScrollArea className="h-full">
              <div className="px-5 pt-4 pb-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNoteRating(noteRating === star ? 0 : star)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "w-6 h-6 transition-colors",
                            star <= noteRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-border/60",
                          )}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                    {noteRating > 0 && (
                      <span className="text-xs text-ink-muted ml-1">{noteRating}/5</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted flex items-center gap-1.5">
                    <MessageSquareText className="w-3 h-3" strokeWidth={1.5} />
                    Private Note
                  </label>
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write a private note about this applicant..."
                    rows={5}
                    className="resize-y text-sm rounded-xl border-border/60 bg-card placeholder:text-ink-muted/50 focus-visible:ring-gold/30"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60">
                  {hasNote ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 text-xs rounded-lg text-rose-600 hover:bg-rose-50 px-3"
                      onClick={onNoteDelete}
                      disabled={isDeletingNote}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                      Delete Note
                    </Button>
                  ) : (
                    <div />
                  )}
                  <Button
                    size="sm"
                    className="h-9 text-xs rounded-lg bg-ink text-white hover:bg-ink-soft px-5 font-medium"
                    onClick={() => onNoteSave(noteText, noteRating)}
                    disabled={isSavingNote}
                  >
                    {isSavingNote ? "Saving..." : hasNote ? "Update Note" : "Save Note"}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
