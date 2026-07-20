'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, relativeTime } from '@/lib/utils';
import { useCampaignTaskSubmissions } from '@/lib/api/hooks/useCampaignTask';
import { getApiErrorMessage } from '@/lib/formatters';
import { type TaskSubmission } from '@/lib/api';
import { TaskSubmissionDetail } from './TaskSubmissionDetail';
import {
  Clock,
  FileText,
  CheckCircle2,
  Star,
  CheckCircle,
  XCircle,
  ChevronRight,
  MessageSquareText,
  Paperclip,
  ArrowLeft,
} from 'lucide-react';

const SUBMISSION_STATUS_META: Record<string, { label: string; icon: typeof Clock; classes: string }> = {
  assigned: {
    label: 'Assigned',
    icon: Clock,
    classes: 'bg-slate-50 text-slate-600 border-slate-200',
  },
  submitted: {
    label: 'Submitted',
    icon: FileText,
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  reviewed: {
    label: 'Reviewed',
    icon: CheckCircle2,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const abs = Math.abs(hash);
  const h1 = 220 + (abs % 40);
  const h2 = 260 + (abs % 30);
  return `linear-gradient(135deg, hsl(${h1}, 35%, 65%), hsl(${h2}, 40%, 45%))`;
}

interface TaskSubmissionsPanelProps {
  campaignId: string;
  onReview: (submissionId: string, notes: string, rating: number) => void;
  onAccept: (submission: TaskSubmission) => void;
  onReject: (submission: TaskSubmission) => void;
  isReviewing: boolean;
  isUpdatingStatus: boolean;
}

export function TaskSubmissionsPanel({
  campaignId,
  onReview,
  onAccept,
  onReject,
  isReviewing,
  isUpdatingStatus,
}: TaskSubmissionsPanelProps) {
  const {
    data: submissionsData,
    isLoading,
    error,
  } = useCampaignTaskSubmissions(campaignId);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mql.matches);
    setIsDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const submissions = submissionsData?.data;

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return null;
    if (statusFilter === 'all') return submissions;
    return submissions.filter((s) => s.status === statusFilter);
  }, [submissions, statusFilter]);

  const selectedSubmission = useMemo(() => {
    if (!selectedId || !filteredSubmissions) return null;
    return filteredSubmissions.find((s) => s._id === selectedId) ?? null;
  }, [selectedId, filteredSubmissions]);

  const handleRowClick = useCallback(
    (id: string) => {
      if (isDesktop) {
        setSelectedId((prev) => (prev === id ? null : id));
      } else {
        setSelectedId(id);
        setShowMobileDetail(true);
      }
    },
    [isDesktop],
  );

  const handleBack = useCallback(() => {
    setShowMobileDetail(false);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedId(null);
    setShowMobileDetail(false);
  }, []);

  const handleReview = useCallback(
    (notes: string, rating: number) => {
      if (!selectedId) return;
      onReview(selectedId, notes, rating);
    },
    [onReview, selectedId],
  );

  const handleAccept = useCallback(
    (sub: TaskSubmission) => {
      onAccept(sub);
    },
    [onAccept],
  );

  const handleReject = useCallback(
    (sub: TaskSubmission) => {
      onReject(sub);
    },
    [onReject],
  );

  const FILTER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'assigned', label: 'Assigned' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-xl border-error-muted">
        <AlertDescription>
          {getApiErrorMessage(error, 'Failed to load submissions')}
        </AlertDescription>
      </Alert>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-24 bg-card border border-border/60 rounded-2xl shadow-luxe">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted-bg mx-auto">
          <FileText className="w-9 h-9 text-ink-muted/40" strokeWidth={1.5} />
        </div>
        <p className="text-base font-serif font-semibold text-ink">
          No task submissions yet
        </p>
        <p className="mt-2 text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
          Shortlist talents to assign the campaign task. Submissions will appear here once submitted.
        </p>
      </div>
    );
  }

  const showListPanel = isDesktop || !showMobileDetail;
  const showDetailPanel = isDesktop || showMobileDetail;

  return (
    <div className="flex flex-col lg:flex-row gap-0 border border-border/60 rounded-2xl bg-card shadow-luxe overflow-hidden lg:min-h-[500px]">
      {/* Left: submission list */}
      {showListPanel && (
        <div className="lg:w-[340px] lg:min-w-[300px] w-full shrink-0 lg:border-r border-border/60 flex flex-col bg-muted-bg/20">
          <div className="px-4 py-3 border-b border-border/60 bg-card">
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    'h-6 px-2.5 rounded-full text-[11px] font-semibold transition-colors border',
                    statusFilter === opt.value
                      ? 'bg-ink text-white border-ink'
                      : 'bg-card text-ink-muted border-border/60 hover:border-border hover:text-ink',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-muted mt-2 font-medium">
              {filteredSubmissions?.length ?? 0}{(filteredSubmissions?.length ?? 0) === 1 ? ' submission' : ' submissions'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredSubmissions && filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-ink-muted">No submissions match this filter</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filteredSubmissions?.map((sub: TaskSubmission) => {
                  const meta = SUBMISSION_STATUS_META[sub.status] ?? SUBMISSION_STATUS_META.assigned;
                  const StatusIcon = meta.icon;
                  const name = sub.talent_name || sub.talent_email || 'Unknown';
                  const isSelected = selectedId === sub._id;
                  const textPreview = sub.response_text
                    ? sub.response_text.length > 100
                      ? sub.response_text.slice(0, 100) + '\u2026'
                      : sub.response_text
                    : null;

                  return (
                    <div key={sub._id}>
                      <button
                        onClick={() => handleRowClick(sub._id)}
                        className={cn(
                          'w-full text-left px-4 py-3 transition-colors hover:bg-cream-soft/50',
                          isSelected && 'bg-cream-soft lg:border-l-2 lg:border-l-gold',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={
                              sub.talent_photo
                                ? undefined
                                : { background: getGradient(name) }
                            }
                          >
                            {sub.talent_photo ? (
                              <img
                                src={sub.talent_photo}
                                alt={name}
                                className="w-full h-full rounded-lg object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-white/80">
                                {getInitials(name)}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-ink truncate">{name}</p>
                              <ChevronRight
                                className={cn(
                                  'w-3.5 h-3.5 text-ink-muted/40 shrink-0 transition-transform lg:hidden',
                                )}
                                strokeWidth={1.5}
                              />
                              {isDesktop && (
                                <ChevronRight
                                  className={cn(
                                    'w-3.5 h-3.5 text-ink-muted/40 shrink-0 transition-transform',
                                    isSelected && 'rotate-90',
                                  )}
                                  strokeWidth={1.5}
                                />
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge
                                className={cn(
                                  'rounded-full text-[10px] font-semibold px-1.5 py-0 border leading-tight',
                                  meta.classes,
                                )}
                              >
                                <StatusIcon className="w-2.5 h-2.5 mr-0.5" strokeWidth={1.5} />
                                {meta.label}
                              </Badge>
                              {sub.submitted_at && (
                                <span className="text-[10px] text-ink-muted/70 font-medium">
                                  {relativeTime(sub.submitted_at)}
                                </span>
                              )}
                            </div>

                            {textPreview && (
                              <p className="mt-1.5 text-[11px] text-ink-muted leading-relaxed line-clamp-2">
                                {textPreview}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-1.5">
                              {sub.files && sub.files.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-ink-muted/60 font-medium">
                                  <Paperclip className="w-2.5 h-2.5" strokeWidth={1.5} />
                                  {sub.files.length} {sub.files.length === 1 ? 'file' : 'files'}
                                </span>
                              )}

                              <div className="flex items-center gap-0.5 ml-auto">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      'w-3 h-3',
                                      (sub.recruiter_rating ?? 0) >= star
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-border/40',
                                    )}
                                    strokeWidth={1.5}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1.5 mt-2 ml-12">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(sub);
                            }}
                            disabled={isUpdatingStatus}
                            className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
                            Accept
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(sub);
                            }}
                            disabled={isUpdatingStatus}
                            className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" strokeWidth={1.5} />
                            Reject
                          </button>
                          {sub.response_text && (
                            <span className="flex items-center gap-1 text-[10px] text-ink-muted/50 ml-auto">
                              <MessageSquareText className="w-2.5 h-2.5" strokeWidth={1.5} />
                              {sub.response_text.length} chars
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right: detail panel */}
      {showDetailPanel && (
        <div className="lg:flex-1 w-full min-w-0 overflow-y-auto">
          {/* Mobile back button */}
          {!isDesktop && selectedSubmission && (
            <div className="sticky top-0 z-10 bg-card border-b border-border/60 px-4 py-3 flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                Back to list
              </button>
            </div>
          )}

          {selectedSubmission ? (
            <TaskSubmissionDetail
              submission={selectedSubmission}
              onClose={!isDesktop ? handleCloseDetail : undefined}
              onReview={handleReview}
              onAccept={
                selectedSubmission.application_id
                  ? () => {
                      handleAccept(selectedSubmission);
                      handleCloseDetail();
                    }
                  : undefined
              }
              onReject={
                selectedSubmission.application_id
                  ? () => {
                      handleReject(selectedSubmission);
                      handleCloseDetail();
                    }
                  : undefined
              }
              isReviewing={isReviewing}
              isUpdatingStatus={isUpdatingStatus}
              variant="inline"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center py-16 px-12">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted-bg mx-auto">
                  <FileText className="w-7 h-7 text-ink-muted/30" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-serif font-semibold text-ink-muted/60">
                  Select a submission to review
                </p>
                <p className="mt-1.5 text-xs text-ink-muted/40 max-w-xs mx-auto leading-relaxed">
                  Click any submission from the list to view its details, add notes, rate, and accept or reject.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
