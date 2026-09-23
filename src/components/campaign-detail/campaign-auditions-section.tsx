"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clapperboard,
  Clock3,
  Download,
  Ellipsis,
  FileText,
  Inbox,
  Info,
  Loader2,
  Paperclip,
  Pencil,
  Play,
  SearchX,
  Send,
  ShieldCheck,
  Star,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useCampaign,
  useCampaignApplications,
  useCampaignSubmissions,
  useReviewTaskSubmission,
  useUpsertCampaignTask,
} from "@/hooks/use-campaigns";
import {
  useDeleteTaskDocument,
  useTaskDocument,
  useUploadTaskDocument,
  TASK_DOCUMENT_ACCEPT,
  TASK_DOCUMENT_MAX_BYTES,
  formatTaskFileSize,
  isAllowedTaskDocument,
  taskDocumentKindLabel,
} from "@/hooks/use-campaign-task";
import { conversationsApi } from "@/lib/api";
import { MessageTalentButton } from "@/components/campaign-detail/message-talent-button";
import type {
  CampaignSubmission,
  EnrichedApplication,
} from "@/lib/api/campaigns";

/* -------------------------------------------------------------------------- */
/*                                    types                                   */
/* -------------------------------------------------------------------------- */

type DisplayStatus =
  | "shortlisted"
  | "assigned"
  | "submitted"
  | "reviewed"
  | "overdue";
type StatusFilter = DisplayStatus | "all";

interface AuditionRow {
  submission: CampaignSubmission;
  application?: EnrichedApplication;
  displayStatus: Exclude<DisplayStatus, "shortlisted">;
  name: string;
  username?: string;
  photo?: string;
  profession: string;
  location: string;
  verified: boolean;
}

interface UnassignedRow {
  application: EnrichedApplication;
  name: string;
  username?: string;
  photo?: string;
  profession: string;
  location: string;
  verified: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                   helpers                                  */
/* -------------------------------------------------------------------------- */

function displayStatusOf(
  submission: CampaignSubmission,
): Exclude<DisplayStatus, "shortlisted"> {
  if (submission.status === "reviewed") return "reviewed";
  if (submission.status === "submitted") return "submitted";
  const deadline = new Date(submission.deadline_at).getTime();
  if (!Number.isNaN(deadline) && deadline < Date.now()) return "overdue";
  return "assigned";
}

function formatDay(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "d MMM yyyy");
}

function talentIdOf(app: EnrichedApplication): string | undefined {
  return typeof app.talent_id === "object" ? app.talent_id._id : app.talent_id;
}

function usernameOf(app: EnrichedApplication): string | undefined {
  if (app.talent_profile?.username) return app.talent_profile.username;
  if (typeof app.talent_id === "object") return app.talent_id.username;
  return undefined;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "–";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}

function newClientMessageId(): string {
  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const statusTone: Record<DisplayStatus, { label: string; pill: string }> = {
  shortlisted: { label: "Shortlisted", pill: "bg-warning-soft text-warning" },
  assigned: { label: "Assigned", pill: "bg-info-soft text-info" },
  submitted: { label: "Submitted", pill: "bg-success-soft text-success" },
  reviewed: { label: "Reviewed", pill: "bg-primary-soft text-primary" },
  overdue: { label: "Overdue", pill: "bg-alert-soft text-alert" },
};

/* -------------------------------------------------------------------------- */
/*                              review (existing                              */
/*                       endpoint + inline pattern)                           */
/* -------------------------------------------------------------------------- */

function ReviewPanel({
  campaignId,
  submission,
}: {
  campaignId: string;
  submission: CampaignSubmission;
}) {
  const review = useReviewTaskSubmission();
  const [notes, setNotes] = useState(submission.recruiter_notes ?? "");
  const [rating, setRating] = useState(
    submission.recruiter_rating != null ? String(submission.recruiter_rating) : "",
  );

  const handleSave = () => {
    const parsed = rating.trim() === "" ? undefined : Number(rating);
    if (
      parsed !== undefined &&
      (Number.isNaN(parsed) || parsed < 0 || parsed > 5)
    ) {
      toast.error("Rating must be between 0 and 5");
      return;
    }
    review.mutate(
      {
        campaignId,
        submissionId: submission._id,
        recruiter_notes: notes.trim() || undefined,
        recruiter_rating: parsed,
      },
      {
        onSuccess: () => toast.success("Review saved"),
        onError: () => toast.error("Could not save review"),
      },
    );
  };

  const videos = submission.files.filter((file) =>
    file.mime_type.startsWith("video"),
  );
  const documents = submission.files.filter(
    (file) => !file.mime_type.startsWith("video"),
  );

  return (
    <div className="mt-2.5 space-y-2.5 border-t border-border/70 pt-2.5">
      {submission.response_text && (
        <p className="text-[13px] leading-snug text-foreground/90">
          {submission.response_text}
        </p>
      )}

      {videos.map((file) => (
        <figure key={file.url} className="overflow-hidden rounded-lg bg-black">
          <video
            src={file.url}
            controls
            preload="metadata"
            playsInline
            className="max-h-56 w-full"
          />
          <figcaption className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] text-white/80">
            <span className="truncate font-medium">{file.name}</span>
            <span className="shrink-0">{formatBytes(file.size)}</span>
          </figcaption>
        </figure>
      ))}

      {documents.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {documents.map((file) => (
            <a
              key={file.url}
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium hover:underline"
            >
              <FileText className="size-3.5 shrink-0" />
              <span className="max-w-[180px] truncate">{file.name}</span>
            </a>
          ))}
        </div>
      )}

      <div className="grid gap-2 rounded-lg bg-secondary/40 p-3">
        <label className="text-xs font-semibold text-muted-foreground">
          Recruiter notes
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Private notes about this audition…"
            className="mt-1 bg-card"
          />
        </label>
        <label className="text-xs font-semibold text-muted-foreground">
          Rating (0–5)
          <Input
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 4.5"
            className="mt-1 bg-card"
          />
        </label>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={review.isPending}
          className="w-fit"
        >
          {review.isPending && <Loader2 className="size-3.5 animate-spin" />}
          Save review
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     task brief attachment (pdf/pptx/…)                    */
/* -------------------------------------------------------------------------- */

function TaskAttachmentManager({ campaignId }: { campaignId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: document } = useTaskDocument(campaignId);
  const uploadDoc = useUploadTaskDocument();
  const deleteDoc = useDeleteTaskDocument();

  const handlePickedFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!isAllowedTaskDocument(file)) {
      setError(
        "Only PDF, Word, PowerPoint, Excel, text or image files are allowed.",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > TASK_DOCUMENT_MAX_BYTES) {
      setError("File must be 50 MB or smaller.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    uploadDoc.mutate(
      { campaignId, file },
      {
        onSuccess: () => toast.success("Task attachment uploaded"),
        onError: () => setError("Could not upload file. Please try again."),
      },
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mt-2.5 border-t border-border/70 pt-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <Paperclip className="size-3.5" />
        Task attachment
        <span className="font-normal">· talent sees this with the task</span>
      </p>
      {document ? (
        <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-secondary/40 p-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-card text-primary">
            <FileText className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold">{document.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {taskDocumentKindLabel(document.name)} ·{" "}
              {formatTaskFileSize(document.size)}
            </p>
          </div>
          <a
            href={document.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Download ${document.name}`}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <Download className="size-4" />
          </a>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadDoc.isPending}
            className="h-9 shrink-0 rounded-lg px-2 text-[11px] font-bold text-primary hover:bg-card disabled:opacity-50"
          >
            {uploadDoc.isPending ? "Uploading…" : "Replace"}
          </button>
          <button
            type="button"
            aria-label="Remove task attachment"
            onClick={() => {
              if (confirm("Remove task attachment?")) {
                deleteDoc.mutate(campaignId, {
                  onSuccess: () => toast.success("Attachment removed"),
                  onError: () => toast.error("Could not remove attachment"),
                });
              }
            }}
            disabled={deleteDoc.isPending}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-destructive disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadDoc.isPending}
          className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50"
        >
          {uploadDoc.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploadDoc.isPending
            ? "Uploading…"
            : "Attach brief, script, PPTX or reference file"}
        </button>
      )}
      {error ? (
        <p className="mt-1 text-[11px] font-medium text-destructive">{error}</p>
      ) : (
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          PDF, Word, PowerPoint, Excel, text or image · up to 50 MB
        </p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={TASK_DOCUMENT_ACCEPT}
        className="hidden"
        onChange={(e) => handlePickedFile(e.target.files?.[0])}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              edit task dialog                              */
/* -------------------------------------------------------------------------- */

function EditTaskDialog({
  campaignId,
  open,
  onOpenChange,
}: {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: campaign } = useCampaign(campaignId);
  const upsertTask = useUpsertCampaignTask();
  const task = campaign?.task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState("file_upload");
  const [deadlineDays, setDeadlineDays] = useState("3");
  const [ndaEnabled, setNdaEnabled] = useState(false);
  const [ndaText, setNdaText] = useState("");
  const [primed, setPrimed] = useState(false);

  // Prime the form from the campaign task each time the dialog opens.
  if (open && !primed) {
    setPrimed(true);
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setTaskType(task?.task_type ?? "file_upload");
    setDeadlineDays(String(task?.deadline_days ?? 3));
    setNdaEnabled(task?.nda_enabled ?? false);
    setNdaText(task?.nda_text ?? "");
  }
  if (!open && primed) setPrimed(false);

  const handleSave = () => {
    const parsedDays = Number(deadlineDays);
    if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 90) {
      toast.error("Deadline must be between 1 and 90 days");
      return;
    }
    upsertTask.mutate(
      {
        campaignId,
        payload: {
          is_enabled: task?.is_enabled ?? true,
          title: title.trim(),
          description: description.trim(),
          task_type: taskType,
          deadline_days: parsedDays,
          nda_enabled: ndaEnabled,
          nda_text: ndaEnabled ? ndaText.trim() || undefined : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Audition task updated");
          onOpenChange(false);
        },
        onError: () => toast.error("Could not update task"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit audition task</DialogTitle>
          <DialogDescription>
            Shortlisted talent are assigned this task automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-muted-foreground">
            Task title
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Submit a 2-minute monologue video"
              className="mt-1 bg-card"
            />
          </label>
          <label className="block text-xs font-semibold text-muted-foreground">
            Instructions
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the talent needs to do…"
              className="mt-1 min-h-[96px] bg-card"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-semibold text-muted-foreground">
              Task type
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground"
              >
                <option value="file_upload">File upload</option>
                <option value="text_response">Text response</option>
              </select>
            </label>
            <label className="block text-xs font-semibold text-muted-foreground">
              Deadline (days after shortlist)
              <Input
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                inputMode="numeric"
                className="mt-1 bg-card"
              />
            </label>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-secondary/40 p-2.5 text-xs font-semibold">
            Require NDA before viewing the task
            <Switch checked={ndaEnabled} onCheckedChange={setNdaEnabled} />
          </label>
          {ndaEnabled && (
            <label className="block text-xs font-semibold text-muted-foreground">
              NDA text
              <Textarea
                value={ndaText}
                onChange={(e) => setNdaText(e.target.value)}
                placeholder="Enter NDA terms…"
                className="mt-1 min-h-[120px] bg-card font-mono text-xs"
              />
            </label>
          )}
          <TaskAttachmentManager campaignId={campaignId} />
          <Button
            onClick={handleSave}
            disabled={upsertTask.isPending}
            className="w-full"
          >
            {upsertTask.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Save task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*            shortlisted talent without an assigned task yet                 */
/* -------------------------------------------------------------------------- */

function ShortlistedCard({
  row,
  campaignName,
  taskEnabled,
  assigning,
  onAssign,
}: {
  row: UnassignedRow;
  campaignName?: string;
  taskEnabled: boolean;
  assigning: boolean;
  onAssign: () => void;
}) {
  const status = statusTone.shortlisted;
  return (
    <article className="rounded-xl border border-dashed border-border bg-card p-3 shadow-sm">
      <div className="flex gap-2.5">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
          {row.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.photo}
              alt={row.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-lg font-bold text-muted-foreground">
              {initialsOf(row.name)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1">
              <h3 className="truncate text-[15px] font-bold leading-snug">
                {row.name}
              </h3>
              {row.verified && (
                <BadgeCheck
                  aria-label="Verified talent"
                  className="size-4 shrink-0 text-primary"
                />
              )}
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold leading-none",
                status.pill,
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {row.profession}
            {row.location ? ` · ${row.location}` : ""}
          </p>
          <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
            {taskEnabled
              ? "Shortlisted — task not assigned yet."
              : "Shortlisted — enable the audition task to assign it."}
          </p>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] gap-1.5 border-t border-border/70 pt-2.5">
        {taskEnabled ? (
          <button
            type="button"
            onClick={onAssign}
            disabled={assigning}
            aria-label={`Assign task to ${row.name}`}
            className="flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {assigning ? (
              <Loader2 className="size-4 shrink-0 animate-spin" />
            ) : (
              <Send className="size-4 shrink-0" />
            )}
            <span className="truncate">Assign task</span>
          </button>
        ) : (
          <span className="flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-muted px-2 text-[13px] font-bold text-muted-foreground">
            <Clock3 className="size-4 shrink-0" />
            <span className="truncate">No task yet</span>
          </span>
        )}
        <MessageTalentButton
          username={row.username}
          talentName={row.name}
          campaignName={campaignName}
          variant="button"
          className="h-11 w-full justify-center text-[13px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${row.name}`}
              className="grid h-11 w-11 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Ellipsis className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            {row.username ? (
              <DropdownMenuItem asChild>
                <Link href={`/talent/${row.username}`}>View profile</Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled>View profile</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 audition card                              */
/* -------------------------------------------------------------------------- */

function AuditionCard({
  row,
  campaignName,
  expanded,
  onToggleExpanded,
  reminding,
  onRemind,
}: {
  row: AuditionRow;
  campaignName?: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  reminding: boolean;
  onRemind: () => void;
}) {
  const { submission, displayStatus } = row;
  const status = statusTone[displayStatus];
  const assigned = formatDay(submission.assigned_at);
  const deadline = formatDay(submission.deadline_at);
  const submittedAt = formatDay(submission.submitted_at);
  const videos = submission.files.filter((file) =>
    file.mime_type.startsWith("video"),
  );
  const totalSize = submission.files.reduce(
    (sum, file) => sum + (file.size || 0),
    0,
  );
  const hasSubmission =
    submission.status === "submitted" || submission.status === "reviewed";
  const isOverdue = displayStatus === "overdue";

  return (
    <article className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex gap-2.5">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
          {row.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.photo}
              alt={row.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-lg font-bold text-muted-foreground">
              {initialsOf(row.name)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1">
              <h3 className="truncate text-[15px] font-bold leading-snug">
                {row.name}
              </h3>
              {row.verified && (
                <BadgeCheck
                  aria-label="Verified talent"
                  className="size-4 shrink-0 text-primary"
                />
              )}
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold leading-none",
                status.pill,
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {row.profession}
            {row.location ? ` · ${row.location}` : ""}
          </p>

          <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
            <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0" />
              <span className="min-w-0">
                <span className="block font-semibold">Assigned</span>
                <span className="block truncate font-bold text-foreground">
                  {assigned ?? "–"}
                </span>
              </span>
            </div>
            {hasSubmission ? (
              <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="size-3.5 shrink-0" />
                <span className="min-w-0">
                  <span className="block font-semibold">Submitted</span>
                  <span className="block truncate font-bold text-foreground">
                    {submittedAt ?? "–"}
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="size-3.5 shrink-0" />
                <span className="min-w-0">
                  <span className="block font-semibold">Deadline</span>
                  <span
                    className={cn(
                      "block truncate font-bold",
                      isOverdue ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {deadline ?? "–"}
                  </span>
                </span>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold">
        {submission.nda_accepted ? (
          <span className="inline-flex items-center gap-1 text-success">
            <ShieldCheck className="size-3.5" />
            NDA Signed
          </span>
        ) : null}
        {hasSubmission ? (
          videos.length > 0 ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Video className="size-3.5" />
              {videos.length} Video{videos.length === 1 ? "" : "s"}
              {totalSize > 0 ? ` · ${formatBytes(totalSize)}` : ""}
            </span>
          ) : submission.files.length > 0 ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <FileText className="size-3.5" />
              {submission.files.length} File
              {submission.files.length === 1 ? "" : "s"}
            </span>
          ) : null
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Upload className="size-3.5" />
            Not Submitted Yet
          </span>
        )}
        {submission.recruiter_rating != null && (
          <span className="inline-flex items-center gap-1 text-foreground">
            <Star className="size-3.5 fill-[var(--gold)] text-[var(--gold)]" />
            {submission.recruiter_rating}
          </span>
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] gap-1.5 border-t border-border/70 pt-2.5">
        {hasSubmission ? (
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Hide" : "Review"} ${row.name}'s audition`}
            className="flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Play className="size-4 shrink-0" />
            <span className="truncate">Review</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onRemind}
            disabled={reminding}
            aria-label={`Remind ${row.name} to submit`}
            className="flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {reminding ? (
              <Loader2 className="size-4 shrink-0 animate-spin" />
            ) : (
              <Send className="size-4 shrink-0" />
            )}
            <span className="truncate">Remind</span>
          </button>
        )}
        <MessageTalentButton
          username={row.username}
          talentName={row.name}
          campaignName={campaignName}
          variant="button"
          className="h-11 w-full justify-center text-[13px]"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${row.name}`}
              className="grid h-11 w-11 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Ellipsis className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            {row.username ? (
              <DropdownMenuItem asChild>
                <Link href={`/talent/${row.username}`}>View profile</Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled>View profile</DropdownMenuItem>
            )}
            {hasSubmission && submission.files.length > 0 ? (
              <DropdownMenuItem asChild>
                <a
                  href={submission.files[0]!.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open first file
                </a>
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && hasSubmission ? (
        <ReviewPanel
          campaignId={submission.campaign_id}
          submission={submission}
        />
      ) : null}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   section                                  */
/* -------------------------------------------------------------------------- */

const filterChips: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "assigned", label: "Assigned" },
  { key: "submitted", label: "Submitted" },
  { key: "reviewed", label: "Reviewed" },
  { key: "overdue", label: "Overdue" },
];

function unassignedRowOf(application: EnrichedApplication): UnassignedRow {
  const profile = application.talent_profile;
  const name =
    profile?.full_legal_name || profile?.username || "Unknown talent";
  const location = [profile?.location?.city, profile?.location?.state]
    .filter(Boolean)
    .join(", ");
  return {
    application,
    name,
    username: usernameOf(application),
    photo: profile?.profile_photo || undefined,
    profession: profile?.professions?.[0]?.trim() || "Talent",
    location,
    verified: profile?.is_verified ?? false,
  };
}

export function CampaignAuditionsSection({ campaignId }: { campaignId: string }) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);

  const {
    data: campaign,
    isLoading: campaignLoading,
    isError: campaignError,
    refetch: refetchCampaign,
  } = useCampaign(campaignId);
  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    isError: submissionsError,
    refetch: refetchSubmissions,
  } = useCampaignSubmissions(campaignId, { limit: 100 });
  const { data: applicationsData } = useCampaignApplications(campaignId, {
    limit: 100,
  });
  const { data: taskDocument } = useTaskDocument(campaignId);

  const upsertTask = useUpsertCampaignTask();

  const submissionRows = useMemo<AuditionRow[]>(() => {
    const submissions = submissionsData?.data ?? [];
    const applications = applicationsData?.data ?? [];
    const byApplicationId = new Map(applications.map((app) => [app._id, app]));
    const byTalentId = new Map<string, EnrichedApplication>();
    for (const app of applications) {
      const talentId = talentIdOf(app);
      if (talentId && !byTalentId.has(talentId)) byTalentId.set(talentId, app);
    }

    return submissions.map((submission) => {
      const application =
        byApplicationId.get(submission.application_id) ??
        byTalentId.get(submission.talent_id);
      const profile = application?.talent_profile;
      const name =
        profile?.full_legal_name ||
        profile?.username ||
        submission.talent_name ||
        "Unknown talent";
      const location = [profile?.location?.city, profile?.location?.state]
        .filter(Boolean)
        .join(", ");
      return {
        submission,
        application,
        displayStatus: displayStatusOf(submission),
        name,
        username: application ? usernameOf(application) : undefined,
        photo: profile?.profile_photo || submission.talent_photo || undefined,
        profession: profile?.professions?.[0]?.trim() || "Talent",
        location,
        verified: profile?.is_verified ?? false,
      };
    });
  }, [submissionsData, applicationsData]);

  // Shortlisted talent with no task submission yet — i.e. shortlisted while
  // the task was disabled, or before it was configured.
  const unassignedRows = useMemo<UnassignedRow[]>(() => {
    const applications = applicationsData?.data ?? [];
    const assignedTalentIds = new Set(
      (submissionsData?.data ?? []).map((s) => s.talent_id),
    );
    const assignedApplicationIds = new Set(
      (submissionsData?.data ?? []).map((s) => s.application_id),
    );
    return applications
      .filter(
        (app) =>
          app.is_shortlisted &&
          !assignedTalentIds.has(talentIdOf(app) ?? "") &&
          !assignedApplicationIds.has(app._id),
      )
      .map(unassignedRowOf);
  }, [submissionsData, applicationsData]);

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: submissionRows.length + unassignedRows.length,
      shortlisted: unassignedRows.length,
      assigned: 0,
      submitted: 0,
      reviewed: 0,
      overdue: 0,
    };
    for (const row of submissionRows) result[row.displayStatus] += 1;
    return result;
  }, [submissionRows, unassignedRows]);

  // Funnel stat: everyone shortlisted, whether or not a task exists yet.
  const shortlistedTotal =
    applicationsData?.shortlisted ?? counts.shortlisted + submissionRows.length;

  const visibleSubmissions = useMemo(() => {
    if (filter === "all") return submissionRows;
    if (filter === "shortlisted") return [];
    return submissionRows.filter((row) => row.displayStatus === filter);
  }, [submissionRows, filter]);
  const visibleUnassigned = useMemo(
    () =>
      filter === "all" || filter === "shortlisted" ? unassignedRows : [],
    [unassignedRows, filter],
  );
  const hasVisible = visibleSubmissions.length + visibleUnassigned.length > 0;

  if (campaignLoading || submissionsLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Skeleton className="h-[118px] rounded-xl" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[76px] rounded-xl" />
          ))}
        </div>
        <div className="scrollbar-none mt-3 flex gap-2 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-28 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="mt-3 space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="flex gap-2.5">
                <Skeleton className="size-14 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <Skeleton className="mt-2.5 h-11 rounded-lg" />
            </div>
          ))}
        </div>
        <p className="flex items-center justify-center gap-2 pt-5 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading auditions…
        </p>
      </div>
    );
  }

  if (campaignError || submissionsError || !campaign) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-2 py-14 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="size-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold">Unable to load auditions</h2>
        <p className="mt-1 max-w-[280px] text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => {
            void refetchCampaign();
            void refetchSubmissions();
          }}
          className="mt-5 flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  const task = campaign.task;
  const taskEnabled = task?.is_enabled ?? false;
  const campaignDeadline = formatDay(campaign.deadline);

  const handleToggle = (enabled: boolean) => {
    upsertTask.mutate(
      {
        campaignId,
        payload: {
          is_enabled: enabled,
          title: task?.title,
          description: task?.description,
          task_type: task?.task_type,
          deadline_days: task?.deadline_days,
          nda_enabled: task?.nda_enabled,
          nda_text: task?.nda_text,
        },
      },
      {
        onSuccess: () =>
          toast.success(
            enabled
              ? "Self-tape audition enabled"
              : "Self-tape audition disabled",
          ),
        onError: () => toast.error("Could not update audition setting"),
      },
    );
  };

  // Re-saving the task assigns it to shortlisted talent that has no
  // submission yet (backend backfills on upsert when enabled).
  const handleAssignMissing = () => {
    if (!task) return;
    upsertTask.mutate(
      {
        campaignId,
        payload: {
          is_enabled: task.is_enabled ?? true,
          title: task.title,
          description: task.description,
          task_type: task.task_type,
          deadline_days: task.deadline_days,
          nda_enabled: task.nda_enabled,
          nda_text: task.nda_text,
        },
      },
      {
        onSuccess: () => toast.success("Task assigned to shortlisted talent"),
        onError: () => toast.error("Could not assign task"),
      },
    );
  };

  const handleRemind = async (row: AuditionRow) => {    if (!row.username) {
      toast.error("Talent username is unavailable");
      return;
    }
    setRemindingId(row.submission._id);
    try {
      const { conversation_id } = await conversationsApi.startByUsername(
        row.username,
      );
      const deadline = formatDay(row.submission.deadline_at) ?? "the deadline";
      await conversationsApi.sendMessage({
        conversation_id,
        content: `Hi ${row.name}, a friendly reminder to submit your self-tape audition for "${campaign.name}" before ${deadline}. Let us know if you need any help!`,
        client_message_id: newClientMessageId(),
      });
      toast.success("Reminder sent");
    } catch {
      toast.error("Could not send reminder");
    } finally {
      setRemindingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Compact header — no large card */}
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold leading-tight">
            Auditions{" "}
            <span className="font-semibold text-muted-foreground">
              ({counts.all})
            </span>
          </h2>
          <p className="truncate text-[13px] text-muted-foreground">
            Self-tape assignments & submissions
          </p>
        </div>
      </header>

      {/* Self-tape setup card — compact */}
      <section
        aria-label="Self-tape audition setup"
        className="mt-3 rounded-xl border border-border bg-card p-3 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Video className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold leading-tight">
              {task?.title?.trim() || "Self-Tape Audition"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {task?.task_type === "text_response"
                ? "Text response"
                : "File upload"}
              {task?.deadline_days != null
                ? ` · Due ${task.deadline_days}d after shortlist`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label="Edit audition task"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-primary"
          >
            <Pencil className="size-4" />
          </button>
          <label className="flex shrink-0 cursor-pointer items-center gap-1.5">
            <Switch
              checked={taskEnabled}
              onCheckedChange={handleToggle}
              disabled={upsertTask.isPending}
              aria-label="Toggle self-tape audition"
            />
            <span className="text-xs font-bold text-muted-foreground">
              {upsertTask.isPending
                ? "Saving…"
                : taskEnabled
                  ? "Enabled"
                  : "Disabled"}
            </span>
          </label>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-border/70 pt-2.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold text-muted-foreground">
                Deadline
              </span>
              <span className="block truncate text-[11px] font-bold">
                {campaignDeadline ?? "Not set"}
              </span>
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <FileText className="size-4 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold text-muted-foreground">
                NDA Required
              </span>
              <span className="block truncate text-[11px] font-bold">
                {task?.nda_enabled ? "Yes" : "No"}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="flex min-w-0 items-center gap-1.5 rounded-lg text-left transition-colors hover:text-primary"
            aria-label="View audition instructions"
          >
            <Info className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-muted-foreground">
                Instructions
              </span>
              <span className="block truncate text-[11px] font-bold text-primary">
                View Details
              </span>
            </span>
          </button>
        </div>

        <TaskAttachmentManager campaignId={campaignId} />
      </section>

      <EditTaskDialog
        campaignId={campaignId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {task?.title?.trim() || "Self-Tape Audition"}
            </DialogTitle>
            <DialogDescription>
              Instructions for assigned talent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {task?.description ? (
              <p className="leading-relaxed text-foreground/90">
                {task.description}
              </p>
            ) : (
              <p className="text-muted-foreground">
                No written instructions were added for this audition.
              </p>
            )}
            <dl className="space-y-1.5 text-[13px]">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Campaign deadline</dt>
                <dd className="font-semibold">{campaignDeadline ?? "Not set"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Submission window</dt>
                <dd className="font-semibold">
                  {task?.deadline_days != null
                    ? `${task.deadline_days} day${task.deadline_days === 1 ? "" : "s"} after assignment`
                    : "Not set"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">NDA required</dt>
                <dd className="font-semibold">
                  {task?.nda_enabled ? "Yes" : "No"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Attachment</dt>
                <dd className="font-semibold">
                  {taskDocument ? (
                    <a
                      href={taskDocument.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-[180px] items-center gap-1 truncate text-primary hover:underline"
                    >
                      <FileText className="size-3.5 shrink-0" />
                      <span className="truncate">{taskDocument.name}</span>
                    </a>
                  ) : (
                    "None"
                  )}
                </dd>
              </div>
            </dl>
            {task?.nda_enabled && task.nda_text ? (
              <p className="rounded-lg bg-muted p-2.5 text-[13px] leading-relaxed text-muted-foreground">
                {task.nda_text}
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {taskEnabled ? (
        <>
          {/* Summary stats — shortlist → assigned → submitted → reviewed */}
          <section
            aria-label="Audition summary"
            className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5 shadow-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-warning-soft text-warning">
                <Star className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-bold leading-none">
                  {shortlistedTotal}
                </span>
                <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                  Shortlisted
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5 shadow-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <Users className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-bold leading-none">
                  {counts.assigned + counts.overdue}
                </span>
                <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                  Assigned
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5 shadow-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                <CheckCircle2 className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-bold leading-none">
                  {counts.submitted}
                </span>
                <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                  Submitted
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5 shadow-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-info-soft text-info">
                <BadgeCheck className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-bold leading-none">
                  {counts.reviewed}
                </span>
                <span className="mt-1 block truncate text-[11px] text-muted-foreground">
                  Reviewed
                </span>
              </span>
            </div>
          </section>

          {/* Status filters */}
          <nav
            aria-label="Filter auditions by status"
            className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
          >
            {filterChips.map((chip) => {
              const active = filter === chip.key;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setFilter(chip.key)}
                  aria-pressed={active}
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {chip.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none",
                      active
                        ? "bg-white/25 text-primary-foreground"
                        : "bg-card text-foreground",
                    )}
                  >
                    {counts[chip.key]}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Talent audition list — shortlisted, assigned, submitted, reviewed */}
          {counts.all === 0 ? (
            <section
              aria-label="No auditions assigned"
              className="flex flex-col items-center px-6 py-14 text-center"
            >
              <span className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
                <Clapperboard className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-bold">No talent assigned yet</h3>
              <p className="mt-1 max-w-[280px] text-sm text-muted-foreground">
                Shortlist an applicant and the audition task is assigned
                automatically. Assigned self-tapes will appear here.
              </p>
            </section>
          ) : !hasVisible ? (
            <section
              aria-label="No auditions in this view"
              className="flex flex-col items-center px-6 py-14 text-center"
            >
              <span className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
                <SearchX className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-bold">No auditions in this view</h3>
              <p className="mt-1 max-w-[280px] text-sm text-muted-foreground">
                No one matches this filter. Try a different status.
              </p>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-5 flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground"
              >
                Show all
              </button>
            </section>
          ) : (
            <section
              aria-label="Audition results"
              className="mt-2 space-y-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-3 lg:space-y-0"
            >
              {visibleUnassigned.map((row) => (
                <ShortlistedCard
                  key={row.application._id}
                  row={row}
                  campaignName={campaign.name}
                  taskEnabled={taskEnabled}
                  assigning={upsertTask.isPending}
                  onAssign={handleAssignMissing}
                />
              ))}
              {visibleSubmissions.map((row) => (
                <AuditionCard
                  key={row.submission._id}
                  row={row}
                  campaignName={campaign.name}
                  expanded={expandedId === row.submission._id}
                  onToggleExpanded={() =>
                    setExpandedId((current) =>
                      current === row.submission._id
                        ? null
                        : row.submission._id,
                    )
                  }
                  reminding={remindingId === row.submission._id}
                  onRemind={() => void handleRemind(row)}
                />
              ))}
            </section>
          )}
        </>
      ) : (
        <section
          aria-label="No auditions configured"
          className="flex flex-col items-center px-6 py-14 text-center"
        >
          <span className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
            <Clapperboard className="size-7" />
          </span>
          <h3 className="mt-4 text-lg font-bold">No auditions configured</h3>
          <p className="mt-1 max-w-[280px] text-sm text-muted-foreground">
            Enable the self-tape audition above to start assigning and
            collecting submissions.
          </p>
        </section>
      )}
    </div>
  );
}
