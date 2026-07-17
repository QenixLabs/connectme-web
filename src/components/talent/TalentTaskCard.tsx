'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type CampaignTask, type TaskSubmission } from '@/lib/api';
import {
  ClipboardList,
  Clock,
  FileText,
  CheckCircle2,
  Upload,
  Send,
  X,
  Download,
  ExternalLink,
} from 'lucide-react';

function formatDeadline(task: CampaignTask, submission: TaskSubmission | null): string {
  if (submission?.status === 'submitted' || submission?.status === 'reviewed') {
    return 'Submitted';
  }
  const assignedAt = submission?.created_at;
  if (!assignedAt) return '';
  const deadline = new Date(assignedAt);
  deadline.setDate(deadline.getDate() + (task.deadline_days || 3));
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return 'Overdue';
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return '1 day left';
  return `${daysLeft} days left`;
}

interface TalentTaskCardProps {
  task: CampaignTask;
  submission: TaskSubmission | null;
  onSubmit: (payload: { response_text?: string; file_urls?: string[] }) => void;
  isSubmitting: boolean;
}

export function TalentTaskCard({ task, submission, onSubmit, isSubmitting }: TalentTaskCardProps) {
  const [responseText, setResponseText] = useState(submission?.response_text || '');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const status = submission?.status || 'assigned';
  const isSubmitted = status === 'submitted' || status === 'reviewed';
  const deadlineLabel = formatDeadline(task, submission);

  const handleSubmit = () => {
    const fileUrls: string[] = [];
    if (pendingFiles.length > 0 && submission?.file_urls) {
      fileUrls.push(...submission.file_urls);
    }
    onSubmit({
      response_text: responseText || undefined,
      file_urls: fileUrls.length > 0 ? fileUrls : undefined,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setPendingFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl shadow-luxe overflow-hidden">
      <div className="bg-gradient-to-r from-brand/5 to-brand/10 border-b border-border/60 px-5 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
          <ClipboardList className="w-4.5 h-4.5 text-brand" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">Assignment Task</p>
          <p className="text-xs text-ink-muted truncate">{task.title}</p>
        </div>
        <Badge
          className={cn(
            'rounded-full text-[10px] font-semibold px-2 py-0.5 border shrink-0',
            status === 'reviewed'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : status === 'submitted'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : deadlineLabel === 'Overdue'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200',
          )}
        >
          {status === 'reviewed' ? (
            <><CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={1.5} /> Reviewed</>
          ) : status === 'submitted' ? (
            <><FileText className="w-3 h-3 mr-1" strokeWidth={1.5} /> Submitted</>
          ) : (
            <><Clock className="w-3 h-3 mr-1" strokeWidth={1.5} /> {deadlineLabel}</>
          )}
        </Badge>
      </div>

      <div className="p-5 space-y-4">
        {task.description && (
          <div className="text-sm text-ink-soft leading-relaxed bg-muted-bg/30 rounded-xl p-3 border border-border/30">
            {task.description}
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-3">
            {submission?.response_text && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted mb-1.5 block">
                  Your Response
                </label>
                <div className="text-sm text-ink-soft bg-muted-bg/30 rounded-xl p-3 border border-border/30 whitespace-pre-wrap">
                  {submission.response_text}
                </div>
              </div>
            )}

            {submission?.file_urls && submission.file_urls.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted mb-1.5 block">
                  Uploaded Files
                </label>
                <div className="space-y-2">
                  {submission.file_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted-bg/60 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-brand" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium text-ink flex-1 truncate">
                        File {i + 1}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-ink-muted/50 group-hover:text-ink-muted" strokeWidth={1.5} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {submission?.recruiter_rating && submission.recruiter_rating > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-200">
                <ClipboardList className="w-4 h-4" strokeWidth={1.5} />
                <span className="font-medium">Recruiter rated: {submission.recruiter_rating}/5</span>
              </div>
            )}

            <p className="text-xs text-ink-muted/70 text-center">
              {status === 'reviewed'
                ? 'Recruiter has reviewed your submission.'
                : 'Awaiting recruiter review.'}
            </p>
          </div>
        ) : (
          <>
            {task.task_type === 'text_response' && (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  Your Response
                </label>
                <Textarea
                  placeholder="Write your response..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="min-h-[120px] text-sm rounded-xl border-border/60 bg-card resize-y focus-visible:ring-gold/30 placeholder:text-ink-muted/50"
                />
              </div>
            )}

            {task.task_type === 'file_upload' && (
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  Upload Files
                </label>
                <div
                  className={cn(
                    'relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
                    dragOver
                      ? 'border-brand bg-brand/5'
                      : 'border-border/60 bg-muted-bg/30 hover:border-brand/50 hover:bg-brand/5',
                  )}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('task-file-input')?.click()}
                >
                  <Upload className="w-8 h-8 text-ink-muted/50 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-ink">Drop files here or click to browse</p>
                  <p className="text-xs text-ink-muted mt-1">Video, audio, images, or documents</p>
                  <input
                    id="task-file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setPendingFiles((prev) => [...prev, ...files]);
                      e.target.value = '';
                    }}
                  />
                </div>

                {pendingFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {pendingFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/60 bg-muted-bg/30">
                        <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5 text-brand" strokeWidth={1.5} />
                        </div>
                        <span className="text-sm text-ink flex-1 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-10 rounded-xl text-sm font-semibold bg-gradient-to-br from-gold to-gold-hover text-white hover:from-gold-bright hover:to-gold shadow-[0_4px_14px_-4px_oklch(0.74_0.13_80/0.45)] transition-all"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                  Submit Task
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
