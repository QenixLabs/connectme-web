'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCampaignTaskSubmissions } from '@/lib/api/hooks/useCampaignTask';
import { getApiErrorMessage } from '@/lib/formatters';
import { type TaskSubmission } from '@/lib/api';
import {
  Clock,
  FileText,
  MessageSquareText,
  Eye,
  Star,
  CheckCircle2,
  User,
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
  onViewSubmission: (submission: TaskSubmission) => void;
}

export function TaskSubmissionsPanel({ campaignId, onViewSubmission }: TaskSubmissionsPanelProps) {
  const {
    data: submissionsData,
    isLoading,
    error,
  } = useCampaignTaskSubmissions(campaignId);

  const submissions = submissionsData?.data;

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

  return (
    <div className="space-y-2">
      {submissions.map((sub: TaskSubmission, idx: number) => {
        const meta = SUBMISSION_STATUS_META[sub.status] ?? SUBMISSION_STATUS_META.assigned;
        const StatusIcon = meta.icon;
        const name = sub.talent_name || sub.talent_email || 'Unknown';

        return (
          <motion.article
            key={sub._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            className="bg-card border border-border/60 rounded-2xl px-5 py-4 shadow-luxe flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-luxe-lg transition-shadow"
          >
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
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
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-white/80">
                    {getInitials(name)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={cn('rounded-full text-[10px] font-semibold px-2 py-0.5 border', meta.classes)}>
                    <StatusIcon className="w-3 h-3 mr-1" strokeWidth={1.5} />
                    {meta.label}
                  </Badge>
                  {sub.recruiter_rating && sub.recruiter_rating > 0 && (
                    <span className="flex items-center gap-0.5 text-[11px] text-amber-600 font-medium">
                      <Star className="w-3 h-3 fill-amber-400" strokeWidth={0} />
                      {sub.recruiter_rating}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {sub.submitted_at && (
                <span className="text-[11px] text-ink-muted">
                  {new Date(sub.submitted_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg text-xs font-medium border-border/60 bg-card hover:bg-cream-soft"
                onClick={() => onViewSubmission(sub)}
              >
                <Eye className="w-3 h-3 mr-1" strokeWidth={1.5} />
                View
              </Button>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
