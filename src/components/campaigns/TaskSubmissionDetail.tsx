'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type TaskSubmission } from '@/lib/api';
import {
  X,
  Star,
  FileText,
  MessageSquareText,
  Download,
  ExternalLink,
  Clock,
  CheckCircle2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const SUBMISSION_STATUS_META: Record<string, { label: string; icon: typeof Clock; classes: string }> = {
  assigned: { label: 'Assigned', icon: Clock, classes: 'bg-slate-50 text-slate-600 border-slate-200' },
  submitted: { label: 'Submitted', icon: FileText, classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  reviewed: { label: 'Reviewed', icon: CheckCircle2, classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

interface TaskSubmissionDetailProps {
  submission: TaskSubmission;
  onClose: () => void;
  onReview: (notes: string, rating: number) => void;
  onAccept?: () => void;
  onReject?: () => void;
  isReviewing?: boolean;
  isUpdatingStatus?: boolean;
}

export function TaskSubmissionDetail({
  submission,
  onClose,
  onReview,
  onAccept,
  onReject,
  isReviewing,
  isUpdatingStatus,
}: TaskSubmissionDetailProps) {
  const [notes, setNotes] = useState(submission.recruiter_notes || '');
  const [rating, setRating] = useState(submission.recruiter_rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const meta = SUBMISSION_STATUS_META[submission.status] ?? SUBMISSION_STATUS_META.assigned;
  const StatusIcon = meta.icon;
  const name = submission.talent_name || submission.talent_email || 'Unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border/60 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-serif font-semibold text-ink">Task Submission</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted-bg transition-colors"
          >
            <X className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">{name}</p>
              <Badge className={cn('mt-1 rounded-full text-[10px] font-semibold px-2 py-0.5 border', meta.classes)}>
                <StatusIcon className="w-3 h-3 mr-1" strokeWidth={1.5} />
                {meta.label}
              </Badge>
            </div>
            {submission.submitted_at && (
              <span className="text-xs text-ink-muted">
                Submitted{' '}
                {new Date(submission.submitted_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          {submission.status === 'assigned' && (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-ink-muted/40 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-ink">Not submitted yet</p>
              <p className="text-xs text-ink-muted mt-1">Waiting for talent to submit their task.</p>
            </div>
          )}

          {submission.response_text && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Text Response</label>
              <div className="rounded-xl border border-border/60 bg-muted-bg/30 p-4 text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
                {submission.response_text}
              </div>
            </div>
          )}

          {submission.file_urls && submission.file_urls.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Files</label>
              <div className="space-y-2">
                {submission.file_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted-bg/30 hover:bg-muted-bg/60 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-brand" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        File {i + 1}
                      </p>
                      <p className="text-[11px] text-ink-muted flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                        Open in new tab
                      </p>
                    </div>
                    <Download className="w-4 h-4 text-ink-muted/50 group-hover:text-ink-muted transition-colors" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          )}

          <hr className="border-border/40" />

          <div className="space-y-3">
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Your Review</label>

            <div className="flex items-center gap-1.5">
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
                      'w-6 h-6 transition-colors',
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-border/60',
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
              {isReviewing ? 'Saving...' : submission.status === 'reviewed' ? 'Update Review' : 'Save Review'}
            </Button>
          </div>
        </div>

        {(onAccept || onReject) && (
          <div className="flex gap-3 px-6 py-4 border-t border-border/60 bg-muted-bg/30 shrink-0">
            {onAccept && (
              <Button
                size="sm"
                onClick={onAccept}
                disabled={isUpdatingStatus}
                className="flex-1 h-10 rounded-xl text-sm font-semibold bg-gradient-to-br from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-500/20 transition-all"
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
        )}
      </div>
    </div>
  );
}
