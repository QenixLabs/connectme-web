import {
  Users,
  Clock,
  ClipboardCheck,
  Hourglass,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardData {
  value: number;
  label: string;
  hint: string;
  tone: "neutral" | "primary" | "violet" | "amber" | "green" | "red";
}

const icons = [Users, Clock, ClipboardCheck, Hourglass, CheckCircle2, XCircle];

const tones: Record<string, string> = {
  neutral: "bg-muted text-foreground",
  primary: "bg-primary text-primary-foreground",
  violet: "bg-[var(--violet)] text-background",
  amber: "bg-[var(--amber)] text-background",
  green: "bg-[var(--success)] text-background",
  red: "bg-[var(--destructive)] text-background",
};

interface StatCardsProps {
  total: number;
  shortlisted: number;
  tasksDone: number;
  pendingReview: number;
  accepted: number;
  rejected: number;
}

export function StatCards({
  total,
  shortlisted,
  tasksDone,
  pendingReview,
  accepted,
  rejected,
}: StatCardsProps) {
  const stats: StatCardData[] = [
    { value: total, label: "TOTAL", hint: "All Applicants", tone: "neutral" },
    {
      value: shortlisted,
      label: "SHORTLISTED",
      hint: `${shortlisted} Applicants`,
      tone: "primary",
    },
    {
      value: tasksDone,
      label: "TASKS DONE",
      hint: "Completed",
      tone: "violet",
    },
    {
      value: pendingReview,
      label: "PENDING REVIEW",
      hint: "Ready to review",
      tone: "amber",
    },
    { value: accepted, label: "ACCEPTED", hint: "Selected", tone: "green" },
    {
      value: rejected,
      label: "REJECTED",
      hint: "Not selected",
      tone: "red",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 xl:grid-cols-6">
      {stats.map((stat, i) => {
        const Icon = icons[i]!;
        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-3 xl:p-4"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl xl:h-10 xl:w-10",
                  tones[stat.tone],
                )}
              >
                <Icon className="h-4 w-4 xl:h-5 xl:w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xl font-bold leading-none xl:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[9px] font-medium tracking-wide text-muted-foreground xl:text-[10px]">
                  {stat.label}
                </p>
              </div>
            </div>
            <p className="mt-2 truncate text-[11px] text-muted-foreground">
              {stat.hint}
            </p>
          </div>
        );
      })}
    </div>
  );
}
