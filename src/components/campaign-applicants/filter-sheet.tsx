import { useState } from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { EnrichedApplication } from "@/lib/api/campaigns";

export const stageOptions = [
  { label: "All Stages", dot: "bg-muted-foreground" },
  { label: "Applied", dot: "bg-[var(--info)]" },
  { label: "Shortlisted", dot: "bg-primary" },
  { label: "Pending Review", dot: "bg-[var(--amber)]" },
  { label: "Accepted", dot: "bg-[var(--success)]" },
  { label: "Rejected", dot: "bg-[var(--destructive)]" },
];

export const taskOptions = [
  { label: "All Status", dot: "bg-muted-foreground" },
  { label: "Not Started", dot: "bg-muted-foreground" },
  { label: "In Progress", dot: "bg-[var(--info)]" },
  { label: "Completed", dot: "bg-[var(--success)]" },
  { label: "Under Review", dot: "bg-[var(--amber)]" },
];

export const availabilityOptions = [
  "All",
  "Available Now",
  "Available in 1 Week",
  "Available in 2+ Weeks",
];

export interface ApplicantFilters {
  stages: string[];
  tasks: string[];
  availability: string[];
  scoreRange: [number, number];
}

export const EMPTY_FILTERS: ApplicantFilters = {
  stages: [],
  tasks: [],
  availability: [],
  scoreRange: [0, 100],
};

export function countActiveFilters(filters: ApplicantFilters): number {
  let count = 0;
  if (filters.stages.length > 0 && !filters.stages.includes("All Stages")) {
    count += filters.stages.length;
  }
  if (filters.tasks.length > 0 && !filters.tasks.includes("All Status")) {
    count += filters.tasks.length;
  }
  if (
    filters.availability.length > 0 &&
    !filters.availability.includes("All")
  ) {
    count += filters.availability.length;
  }
  if (filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) {
    count += 1;
  }
  return count;
}

function stageMatches(app: EnrichedApplication, stages: string[]): boolean {
  if (stages.length === 0 || stages.includes("All Stages")) return true;
  return stages.some((stage) => {
    switch (stage) {
      case "Applied":
        return app.status === "pending" && !app.is_shortlisted;
      case "Shortlisted":
        return app.is_shortlisted;
      case "Pending Review":
        return app.task_submission_status === "submitted";
      case "Accepted":
        return app.status === "accepted";
      case "Rejected":
        return app.status === "rejected";
      default:
        return true;
    }
  });
}

function taskKey(
  app: EnrichedApplication,
): "not-started" | "in-progress" | "completed" | "under-review" | null {
  // Accepted applicants count as completed; rejected ones have no task state.
  if (app.status === "accepted") return "completed";
  if (app.status === "rejected") return null;
  switch (app.task_submission_status) {
    case "submitted":
      return "under-review";
    case "reviewed":
      return "completed";
    case "assigned":
      // No dedicated "in progress" status exists in the API enum, so an
      // assigned (but unsubmitted) task is the closest match.
      return "in-progress";
    default:
      return "not-started";
  }
}

function taskMatches(app: EnrichedApplication, tasks: string[]): boolean {
  if (tasks.length === 0 || tasks.includes("All Status")) return true;
  const key = taskKey(app);
  return tasks.some((task) => {
    switch (task) {
      case "Not Started":
        return key === "not-started";
      case "In Progress":
        return key === "in-progress";
      case "Completed":
        return key === "completed";
      case "Under Review":
        return key === "under-review";
      default:
        return true;
    }
  });
}

function availabilityMatches(
  app: EnrichedApplication,
  availability: string[],
): boolean {
  if (availability.length === 0 || availability.includes("All")) return true;
  // The API exposes a 3-value enum, so the week-based options are mapped to
  // the closest equivalent.
  const value = app.talent_profile?.availability ?? "available";
  return availability.some((option) => {
    switch (option) {
      case "Available Now":
        return value === "available";
      case "Available in 1 Week":
        return value === "busy";
      case "Available in 2+ Weeks":
        return value === "not_available";
      default:
        return true;
    }
  });
}

export function applyApplicantFilters(
  applications: EnrichedApplication[],
  filters: ApplicantFilters,
): EnrichedApplication[] {
  const [min, max] = filters.scoreRange;
  const scoreActive = min > 0 || max < 100;
  return applications.filter((app) => {
    if (!stageMatches(app, filters.stages)) return false;
    if (!taskMatches(app, filters.tasks)) return false;
    if (!availabilityMatches(app, filters.availability)) return false;
    if (scoreActive) {
      const score = app.match_score ?? 0;
      if (score < min || score > max) return false;
    }
    return true;
  });
}

function Row({
  label,
  dot,
  checked,
  onToggle,
}: {
  label: string;
  dot?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 last:border-0"
    >
      {dot && <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />}
      <span
        className={cn(
          "flex-1 text-left text-sm",
          checked ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-md border",
          checked ? "border-primary bg-primary" : "border-border",
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary-foreground">
            <path
              d="M2 6.5L4.5 9L10 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

function Group({
  title,
  onClear,
  children,
}: {
  title: string;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        {onClear && (
          <button
            onClick={onClear}
            className="text-sm text-primary underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {children}
      </div>
    </div>
  );
}

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: ApplicantFilters;
  onApply: (filters: ApplicantFilters) => void;
}

export function FilterSheet({
  open,
  onOpenChange,
  initial,
  onApply,
}: FilterSheetProps) {
  const [draft, setDraft] = useState<ApplicantFilters>(initial);

  // Refresh the draft from the applied filters every time the sheet opens
  // (render-phase update, so cancelling never leaves a stale draft behind).
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setDraft(initial);
  }

  const toggleIn = (key: "stages" | "tasks" | "availability", label: string) =>
    setDraft((d) => ({
      ...d,
      [key]: d[key].includes(label)
        ? d[key].filter((x) => x !== label)
        : [...d[key], label],
    }));

  const clearGroup = (key: "stages" | "tasks" | "availability") =>
    setDraft((d) => ({ ...d, [key]: [] }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl border-border bg-background p-5 [&>button]:hidden"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Filter Applicants</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Group title="Stage" onClear={() => clearGroup("stages")}>
          {stageOptions.map((o) => (
            <Row
              key={o.label}
              label={o.label}
              dot={o.dot}
              checked={draft.stages.includes(o.label)}
              onToggle={() => toggleIn("stages", o.label)}
            />
          ))}
        </Group>

        <Group title="Task Status" onClear={() => clearGroup("tasks")}>
          {taskOptions.map((o) => (
            <Row
              key={o.label}
              label={o.label}
              dot={o.dot}
              checked={draft.tasks.includes(o.label)}
              onToggle={() => toggleIn("tasks", o.label)}
            />
          ))}
        </Group>

        <Group
          title="Availability"
          onClear={() => clearGroup("availability")}
        >
          {availabilityOptions.map((o) => (
            <Row
              key={o}
              label={o}
              checked={draft.availability.includes(o)}
              onToggle={() => toggleIn("availability", o)}
            />
          ))}
        </Group>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Profile Score</h3>
            <button
              onClick={() =>
                setDraft((d) => ({ ...d, scoreRange: [0, 100] }))
              }
              className="text-sm text-primary underline underline-offset-2"
            >
              Clear
            </button>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
          <Slider
            value={[draft.scoreRange[0], draft.scoreRange[1]]}
            onValueChange={([min, max]) =>
              setDraft((d) => ({
                ...d,
                scoreRange: [min ?? 0, max ?? 100],
              }))
            }
            max={100}
            step={5}
            className="mt-2"
          />
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {draft.scoreRange[0]}% - {draft.scoreRange[1]}%
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 pb-4">
          <button
            onClick={() => {
              onApply(draft);
              onOpenChange(false);
            }}
            className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground"
          >
            Apply Filters
            {countActiveFilters(draft) > 0 &&
              ` (${countActiveFilters(draft)})`}
          </button>
          <button
            onClick={() => {
              setDraft(EMPTY_FILTERS);
              onApply(EMPTY_FILTERS);
            }}
            className="w-full rounded-xl border border-primary py-3.5 text-base font-semibold text-primary"
          >
            Reset All
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
