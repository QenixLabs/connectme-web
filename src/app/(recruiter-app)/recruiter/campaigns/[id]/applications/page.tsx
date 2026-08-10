"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  UserRound,
  Copy,
  Search,
  ChevronDown,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Flame,
  Loader2,
} from "lucide-react";
import { useCampaign, useCampaignApplications } from "@/hooks/use-campaigns";
import type { EnrichedApplication } from "@/lib/api/campaigns";
import { StatCards } from "@/components/campaign-applicants/stat-cards";
import { StageColumn } from "@/components/campaign-applicants/stage-column";
import type { Stage } from "@/components/campaign-applicants/stage-column";
import { FilterSheet } from "@/components/campaign-applicants/filter-sheet";
import { cn } from "@/lib/utils";

type ChipKey =
  | "all"
  | "applied"
  | "shortlisted"
  | "completed"
  | "review"
  | "accepted"
  | "rejected";

interface ChipDef {
  label: string;
  key: ChipKey;
  icon: typeof Star | null;
  tone?: string;
  countFn: (counts: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    shortlisted: number;
    tasksDone: number;
    pendingReview: number;
  }) => number;
}

const chipDefs: ChipDef[] = [
  { label: "All", key: "all", icon: null, countFn: (c) => c.total },
  { label: "Applied", key: "applied", icon: null, countFn: (c) => c.pending },
  {
    label: "Shortlisted",
    key: "shortlisted",
    icon: Star,
    tone: "text-primary",
    countFn: (c) => c.shortlisted,
  },
  {
    label: "Completed Task",
    key: "completed",
    icon: CheckCircle2,
    tone: "text-[var(--success)]",
    countFn: (c) => c.tasksDone,
  },
  {
    label: "Pending Review",
    key: "review",
    icon: AlertCircle,
    tone: "text-[var(--amber)]",
    countFn: (c) => c.pendingReview,
  },
  {
    label: "Accepted",
    key: "accepted",
    icon: CheckCircle2,
    tone: "text-[var(--success)]",
    countFn: (c) => c.accepted,
  },
  {
    label: "Rejected",
    key: "rejected",
    icon: XCircle,
    tone: "text-[var(--destructive)]",
    countFn: (c) => c.rejected,
  },
];

const legend = [
  { label: "Not Started", dot: "bg-muted-foreground" },
  { label: "In Progress", dot: "bg-[var(--info)]" },
  { label: "Completed", dot: "bg-[var(--success)]" },
  { label: "Under Review", dot: "bg-[var(--amber)]" },
];

const filterSelects = ["Stage", "Task Status", "Availability"];

export default function RecruiterCampaignApplicationsPage() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id;

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeChip, setActiveChip] = useState<ChipKey>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const { data: campaign, isLoading: campaignLoading } = useCampaign(campaignId);
  const { data: appData, isLoading: appsLoading } = useCampaignApplications(
    campaignId,
    {
      search: search || undefined,
      sort,
    },
  );

  const applications = appData?.data ?? [];
  const total = appData?.total ?? 0;
  const pending = appData?.pending ?? 0;
  const accepted = appData?.accepted ?? 0;
  const rejected = appData?.rejected ?? 0;
  const shortlisted = appData?.shortlisted ?? 0;

  const tasksDone = useMemo(
    () =>
      applications.filter(
        (a) => a.task_submission_status === "reviewed",
      ).length,
    [applications],
  );

  const pendingReview = useMemo(
    () =>
      applications.filter(
        (a) => a.task_submission_status === "submitted",
      ).length,
    [applications],
  );

  const stages: Stage[] = useMemo(() => {
    const applied = applications.filter(
      (a) => a.status === "pending" && !a.is_shortlisted,
    );
    const shortlistedApps = applications.filter((a) => a.is_shortlisted);
    const review = applications.filter(
      (a) => a.task_submission_status === "submitted" && a.status === "pending",
    );
    const acceptedApps = applications.filter((a) => a.status === "accepted");
    const rejectedApps = applications.filter((a) => a.status === "rejected");

    const visibleLimit = view === "grid" ? 2 : 5;

    return [
      {
        key: "applied",
        title: "Applied",
        count: applied.length,
        applicants: applied.slice(0, visibleLimit),
        more: Math.max(0, applied.length - visibleLimit),
      },
      {
        key: "shortlisted",
        title: "Shortlisted",
        count: shortlistedApps.length,
        subtitle: `${shortlistedApps.filter((a) => a.task_submission_status === "reviewed").length} Completed \u2022 ${shortlistedApps.filter((a) => a.task_submission_status !== "reviewed").length} Pending`,
        applicants: shortlistedApps.slice(0, visibleLimit),
        more: Math.max(0, shortlistedApps.length - visibleLimit),
      },
      {
        key: "review",
        title: "Pending Review",
        count: review.length,
        subtitle: "Ready for your review",
        applicants: review.slice(0, visibleLimit),
        more: Math.max(0, review.length - visibleLimit),
      },
      {
        key: "accepted",
        title: "Accepted",
        count: acceptedApps.length,
        applicants: acceptedApps.slice(0, visibleLimit),
        more: Math.max(0, acceptedApps.length - visibleLimit),
      },
      {
        key: "rejected",
        title: "Rejected",
        count: rejectedApps.length,
        applicants: rejectedApps.slice(0, visibleLimit),
        more: Math.max(0, rejectedApps.length - visibleLimit),
      },
    ];
  }, [applications, view]);

  const counts = {
    total,
    pending,
    accepted,
    rejected,
    shortlisted,
    tasksDone,
    pendingReview,
  };

  const isLoading = campaignLoading || appsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href={`/recruiter/campaigns/${campaignId}`}
            className="flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Campaign
          </Link>
          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--destructive)] text-[9px] font-bold text-foreground">
                1
              </span>
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground">
              <UserRound className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {/* Title + stats */}
        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-6">
          <div className="xl:w-[220px] xl:shrink-0">
            <h1 className="text-3xl font-bold tracking-tight">
              {campaign?.name || "Campaign"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} applicant{total !== 1 ? "s" : ""}{" "}
              {shortlisted > 0 && `\u2022 ${shortlisted} shortlisted`}
            </p>
            <div className="mt-3 hidden w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground xl:flex">
              Campaign ID: {campaignId.slice(0, 12)}
              <Copy className="h-3.5 w-3.5 cursor-pointer" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <StatCards
              total={total}
              shortlisted={shortlisted}
              tasksDone={tasksDone}
              pendingReview={pendingReview}
              accepted={accepted}
              rejected={rejected}
            />
          </div>
        </div>

        {/* Search + filters */}
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 lg:w-[240px] lg:flex-none">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                placeholder="Search applicants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {filterSelects.map((f) => (
              <button
                key={f}
                onClick={() => setFiltersOpen(true)}
                className={cn(
                  "flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground",
                  f === "Task Status" &&
                    "border-primary text-primary lg:border-border lg:text-muted-foreground",
                )}
              >
                {f} <ChevronDown className="h-4 w-4" />
              </button>
            ))}
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground"
            >
              <SlidersHorizontal className="h-4 w-4" /> More Filters
            </button>
          </div>

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <div className="flex h-11 items-center gap-1 rounded-xl border border-border bg-card p-1">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "flex h-9 w-10 items-center justify-center rounded-lg",
                  view === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "flex h-9 w-10 items-center justify-center rounded-lg",
                  view === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
              className="flex h-11 items-center gap-8 rounded-xl border border-border bg-card px-3 text-sm"
            >
              <span className="text-muted-foreground">
                Sort: <span className="text-foreground">{sort === "newest" ? "Newest" : "Oldest"}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chipDefs.map((chip) => {
            const count = chip.countFn(counts);
            const isActive = activeChip === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => setActiveChip(chip.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-muted-foreground/40",
                )}
              >
                {chip.icon && (
                  <chip.icon className={cn("h-3.5 w-3.5", chip.tone)} />
                )}
                {chip.label} ({count})
              </button>
            );
          })}
          <button className="ml-auto flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium">
            <Flame className="h-3.5 w-3.5 text-[var(--destructive)]" /> Needs
            Review ({pendingReview})
          </button>
        </div>

        {/* Stage board */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
          {stages.map((stage) => (
            <StageColumn key={stage.key} stage={stage} />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-border bg-card px-4 py-3 text-xs">
            <span className="font-medium text-muted-foreground">
              Task Status Legend:
            </span>
            {legend.map((l) => (
              <span key={l.label} className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-sm", l.dot)} />
                {l.label}
              </span>
            ))}
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
            <span className="h-5 w-5 rounded-md border border-border" />
            Show completed only
          </label>
        </div>
      </main>

      <FilterSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
    </div>
  );
}
