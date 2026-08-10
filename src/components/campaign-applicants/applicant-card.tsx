import {
  MessageSquare,
  Eye,
  Star,
  MoreVertical,
  Bookmark,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import type { EnrichedApplication, TaskSubmissionStatus } from "@/lib/api/campaigns";
import { cn } from "@/lib/utils";

type TaskState = "not-started" | "in-progress" | "completed" | "under-review";

function taskStateFromStatus(
  status: TaskSubmissionStatus | null,
  appStatus: string,
): { taskState: TaskState; taskLabel: string } {
  if (appStatus === "rejected") {
    return { taskState: "not-started", taskLabel: "Rejected" };
  }
  if (appStatus === "accepted") {
    return { taskState: "completed", taskLabel: "Accepted" };
  }
  switch (status) {
    case "submitted":
      return { taskState: "under-review", taskLabel: "Under Review" };
    case "reviewed":
      return { taskState: "completed", taskLabel: "Task Completed" };
    case "assigned":
      return { taskState: "not-started", taskLabel: "Not Started" };
    default:
      return { taskState: "not-started", taskLabel: "Not Started" };
  }
}

const stateStyles: Record<
  TaskState,
  { chip: string; icon: typeof CheckCircle2; bar: string }
> = {
  "not-started": {
    chip: "bg-muted text-muted-foreground",
    icon: Clock,
    bar: "bg-muted-foreground/40",
  },
  "in-progress": {
    chip: "bg-[var(--info)]/15 text-[var(--info)]",
    icon: Loader2,
    bar: "bg-[var(--info)]",
  },
  completed: {
    chip: "bg-[var(--success)]/15 text-[var(--success)]",
    icon: CheckCircle2,
    bar: "bg-[var(--success)]",
  },
  "under-review": {
    chip: "bg-[var(--amber)]/15 text-[var(--amber)]",
    icon: Clock,
    bar: "bg-[var(--amber)]",
  },
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function getDisplayName(app: EnrichedApplication): string {
  const tp = app.talent_profile;
  if (tp?.full_legal_name) return tp.full_legal_name;
  if (tp?.username) return tp.username;
  const tid = app.talent_id;
  if (typeof tid === "object") return tid.full_legal_name || tid.username || "Unknown";
  return "Unknown";
}

function getRole(app: EnrichedApplication): string {
  return app.talent_profile?.professions?.[0] || "";
}

function getCity(app: EnrichedApplication): string {
  return app.talent_profile?.location?.city || "";
}

interface ApplicantCardProps {
  application: EnrichedApplication;
  stage: string;
  showStar?: boolean;
}

export function ApplicantCard({
  application,
  stage,
  showStar = true,
}: ApplicantCardProps) {
  const rejected = stage === "rejected";
  const { taskState, taskLabel } = taskStateFromStatus(
    application.task_submission_status,
    application.status,
  );
  const s = stateStyles[taskState];
  const Icon = rejected ? XCircle : s.icon;
  const name = getDisplayName(application);
  const role = getRole(application);
  const city = getCity(application);
  const rating = application.note?.rating;
  const match = application.match_score;
  const bookmarked = application.is_shortlisted;
  const progress =
    application.task_submission_status === "reviewed"
      ? 100
      : application.task_submission_status === "submitted"
        ? 80
        : application.task_submission_status === "assigned"
          ? 20
          : 0;

  const noteText = application.note?.note_text || "";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/60 p-3">
      {bookmarked && (
        <div
          className={cn(
            "absolute right-2 top-0 flex h-8 w-6 items-end justify-center rounded-b-sm pb-1",
            "bg-primary",
          )}
        >
          <Bookmark className="h-3 w-3 text-primary-foreground" fill="currentColor" />
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "flex items-start justify-between gap-2",
              bookmarked && "pr-7",
            )}
          >
            <p className="truncate text-sm font-semibold">{name}</p>
            {rating != null && (
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                <Star className="h-3 w-3 text-[var(--gold)]" fill="currentColor" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {[role, city].filter(Boolean).join(" \u2022 ")}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Profile Match</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                match >= 85
                  ? "bg-[var(--success)]/15 text-[var(--success)]"
                  : match >= 60
                    ? "bg-[var(--amber)]/15 text-[var(--amber)]"
                    : "bg-[var(--destructive)]/15 text-[var(--destructive)]",
              )}
            >
              {match}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium",
            rejected ? "bg-[var(--destructive)]/15 text-[var(--destructive)]" : s.chip,
          )}
        >
          <Icon className="h-3 w-3" />
          {taskLabel}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{noteText || "No notes yet"}</span>
        {progress > 0 && (
          <span className="ml-2 shrink-0 font-medium">{progress}%</span>
        )}
      </div>

      {progress > 0 && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", s.bar)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-muted-foreground">
        <button className="flex-1 py-1 transition-colors hover:text-foreground">
          <MessageSquare className="mx-auto h-4 w-4" />
        </button>
        <span className="h-5 w-px bg-border" />
        <button className="flex-1 py-1 transition-colors hover:text-foreground">
          <Eye className="mx-auto h-4 w-4" />
        </button>
        {showStar && !rejected && (
          <>
            <span className="h-5 w-px bg-border" />
            <button className="flex-1 py-1 transition-colors hover:text-primary">
              <Star className="mx-auto h-4 w-4" />
            </button>
          </>
        )}
        <span className="h-5 w-px bg-border" />
        <button className="flex-1 py-1 transition-colors hover:text-foreground">
          <MoreVertical className="mx-auto h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
