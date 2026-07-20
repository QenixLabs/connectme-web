"use client";

import { useState } from "react";
import { Star, FileText, ExternalLink, Clock, CheckCircle2, AlertCircle, CheckCircle, XCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { EnrichedApplication } from "../campaign-application-card";

const SUBMISSION_STATUS_META: Record<string, { label: string; icon: typeof Clock; classes: string }> = {
  assigned: { label: "Assigned", icon: Clock, classes: "bg-slate-50 text-slate-600 border-slate-200" },
  submitted: { label: "Submitted", icon: AlertCircle, classes: "bg-blue-50 text-blue-700 border-blue-200" },
  reviewed: { label: "Reviewed", icon: CheckCircle2, classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

interface SubmissionReviewTabProps {
  application: EnrichedApplication;
  onReview: (notes: string, rating: number) => void;
  onAccept?: () => void;
  onReject?: () => void;
  isReviewing?: boolean;
  isUpdatingStatus?: boolean;
}

export function SubmissionReviewTab({
  application,
  onReview,
  onAccept,
  onReject,
  isReviewing,
  isUpdatingStatus,
}: SubmissionReviewTabProps) {
  const submission = application.task_submission;

  const [notes, setNotes] = useState(submission?.recruiter_notes || "");
  const [rating, setRating] = useState(submission?.recruiter_rating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  if (!submission) {
    return (
      <div className="text-center py-8">
        <Clock className="w-10 h-10 text-ink-muted/30 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm font-semibold text-ink">No task assigned</p>
        <p className="text-xs text-ink-muted mt-1">
          This campaign may not have a task configured, or the task has not been assigned to this talent.
        </p>
      </div>
    );
  }

  const meta = SUBMISSION_STATUS_META[submission.status] ?? SUBMISSION_STATUS_META.assigned;
  const StatusIcon = meta.icon;

  return (
    <div className="space-y-5 py-1">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <Badge className={cn("rounded-full text-[10px] font-semibold px-2.5 py-1 border", meta.classes)}>
          <StatusIcon className="w-3 h-3 mr-1.5" strokeWidth={1.5} />
          {meta.label}
        </Badge>
        {submission.submitted_at && (
          <span className="text-xs text-ink-muted">
            {submission.status === "submitted" ? "Submitted " : ""}
            {new Date(submission.submitted_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Deadline info */}
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <Clock className="w-3 h-3" strokeWidth={1.5} />
        <span>
          Deadline:{" "}
          {new Date(submission.deadline_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="text-ink-muted/60">
          · Assigned:{" "}
          {new Date(submission.assigned_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Not submitted yet state */}
      {submission.status === "assigned" && (
        <div className="text-center py-6 rounded-xl border border-dashed border-border/60 bg-cream-pale/50">
          <Clock className="w-8 h-8 text-ink-muted/40 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-ink">Waiting for submission</p>
          <p className="text-xs text-ink-muted mt-1">The talent has not submitted their task yet.</p>
        </div>
      )}

      {/* Text response */}
      {submission.response_text && (
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
            Text Response
          </label>
          <div className="rounded-xl border border-border/60 bg-muted-bg/30 p-4 text-sm text-ink-soft leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
            {submission.response_text}
          </div>
        </div>
      )}

      {/* Files */}
      {submission.files && submission.files.length > 0 && (
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
            Attachments
          </label>
          <div className="space-y-2">
            {submission.files.map((file, i) => (
              <a
                key={i}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted-bg/30 hover:bg-muted-bg/60 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-brand" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                  <p className="text-[11px] text-ink-muted flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                    Open in new tab
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Review section - only for submitted status */}
      {submission.status !== "assigned" && (
        <>
          <hr className="border-border/40" />

          <div className="space-y-3">
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Your Review
            </label>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? 0 : star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-6 h-6 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-border/60",
                    )}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-xs text-ink-muted ml-1">{rating}/5</span>
              )}
            </div>

            <Textarea
              placeholder="Add private notes about this submission..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] text-sm rounded-xl border-border/60 bg-card resize-y focus-visible:ring-gold/30 placeholder:text-ink-muted/50"
            />

            <Button
              size="sm"
              onClick={() => onReview(notes, rating)}
              disabled={isReviewing}
              className="w-full h-10 rounded-xl text-sm font-semibold bg-gradient-to-br from-gold to-gold-hover text-white hover:from-gold-bright hover:to-gold shadow-[0_4px_14px_-4px_oklch(0.74_0.13_80/0.45)] transition-all"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
              {isReviewing ? "Saving..." : submission.status === "reviewed" ? "Update Review" : "Save Review"}
            </Button>
          </div>
        </>
      )}

      {/* Accept/Reject actions */}
      {(onAccept || onReject) && (
        <>
          <hr className="border-border/40" />
          <div className="flex gap-3">
            {onAccept && (
              <Button
                size="sm"
                onClick={onAccept}
                disabled={isUpdatingStatus}
                className="flex-1 h-10 rounded-xl text-sm font-semibold bg-gradient-to-br from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                Accept Talent
              </Button>
            )}
            {onReject && (
              <Button
                size="sm"
                variant="outline"
                onClick={onReject}
                disabled={isUpdatingStatus}
                className="flex-1 h-10 rounded-xl text-sm font-medium border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                Reject
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
