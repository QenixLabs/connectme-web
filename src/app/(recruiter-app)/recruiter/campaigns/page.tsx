"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Briefcase,
  MapPin,
  Users,
  Loader2,
  FolderKanban,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useRecruiterCampaigns,
  useCampaignCount,
} from "@/hooks/use-campaigns";
import { cn, relativeTime } from "@/lib/utils";
import type { Campaign } from "@/lib/api/campaigns";

/* -------------------------------------------------------------------------- */
/*                                    STATUS                                  */
/* -------------------------------------------------------------------------- */

type DisplayStatus = "Active" | "Draft" | "Completed";

function toDisplayStatus(status: Campaign["status"]): DisplayStatus {
  if (status === "closed") return "Completed";
  return status === "active" ? "Active" : "Draft";
}

const statusStyles: Record<DisplayStatus, string> = {
  Active:
    "border-accent/40 bg-accent/10 text-accent",
  Draft:
    "border-muted-foreground/40 bg-muted/50 text-muted-foreground",
  Completed:
    "border-blue-500/40 bg-blue-500/10 text-blue-400",
};

const statusDot: Record<DisplayStatus, string> = {
  Active: "bg-accent",
  Draft: "bg-muted-foreground",
  Completed: "bg-blue-400",
};

/* -------------------------------------------------------------------------- */
/*                                  STAT CARD                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon,
  value,
  label,
  tone,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  tone: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg bg-secondary"
        )}
      >
        <Icon className={cn("h-5 w-5", tone)} />
      </div>
      <div className="mt-3 text-2xl font-semibold text-foreground">
        {loading ? (
          <div className="h-7 w-10 animate-pulse rounded bg-muted" />
        ) : (
          value
        )}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               CAMPAIGN CARD                                */
/* -------------------------------------------------------------------------- */

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const display = toDisplayStatus(campaign.status);

  const dateRange = useMemo(() => {
    if (!campaign.dates?.start && !campaign.dates?.end) return null;
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    if (campaign.dates?.start && campaign.dates?.end)
      return `${fmt(campaign.dates.start)} - ${fmt(campaign.dates.end)}`;
    if (campaign.dates?.start) return `From ${fmt(campaign.dates.start)}`;
    return `Until ${fmt(campaign.dates!.end!)}`;
  }, [campaign.dates]);

  const location = [campaign.location?.city, campaign.location?.state]
    .filter(Boolean)
    .join(", ");

  const ctaLabel =
    campaign.status === "active"
      ? "View Details"
      : campaign.status === "draft"
        ? "Continue Setup"
        : "View Report";

  const ctaHref =
    campaign.status === "draft"
      ? `/recruiter/campaigns/${campaign._id}/edit`
      : `/recruiter/campaigns/${campaign._id}`;

  return (
    <Card className="overflow-hidden border-border bg-card p-4 lg:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Thumbnail */}
        <div className="shrink-0 sm:w-40 md:w-56">
          <div
            className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-border bg-secondary"
          >
            {campaign.cover_image_url ? (
              <img
                src={campaign.cover_image_url}
                alt={campaign.name}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <span className="px-3 text-center text-xs text-muted-foreground">
                No image
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h2 className="min-w-0 flex-1 truncate text-lg font-semibold leading-snug text-foreground">
              {campaign.name}
            </h2>
            <Badge
              variant="outline"
              className={cn("shrink-0 gap-1.5", statusStyles[display])}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[display])} />
              {display}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="More options"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/recruiter/campaigns/${campaign._id}`}>View details</Link>
                </DropdownMenuItem>
                {campaign.status === "draft" && (
                  <DropdownMenuItem asChild>
                    <Link href={`/recruiter/campaigns/${campaign._id}/edit`}>Edit</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {dateRange && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {dateRange}
              </span>
            )}
            {campaign.role_type && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> {campaign.role_type}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {location}
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-center">
              <p className="text-base font-semibold text-foreground">
                {campaign.applications_count}
              </p>
              <p className="text-[11px] text-muted-foreground">Applicants</p>
            </div>
            {campaign.deadline && (
              <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-center">
                <p className="text-base font-semibold text-foreground">
                  {new Date(campaign.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-[11px] text-muted-foreground">Deadline</p>
              </div>
            )}
            {campaign.visibility && (
              <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-center">
                <p className="text-base font-semibold capitalize text-foreground">
                  {campaign.visibility.replace("_", " ")}
                </p>
                <p className="text-[11px] text-muted-foreground">Visibility</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Updated {relativeTime(campaign.updated_at)}
            </span>
            <Link href={ctaHref} className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-accent/40 bg-accent/10 text-sm font-medium text-accent hover:bg-accent/20"
              >
                {ctaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SKELETONS                                   */
/* -------------------------------------------------------------------------- */

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-7 w-10 animate-pulse rounded bg-muted" />
      <div className="mt-1 h-3 w-20 animate-pulse rounded bg-muted" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card p-4 lg:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="shrink-0 sm:w-40 md:w-56">
          <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-2">
            <div className="h-6 flex-1 animate-pulse rounded bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  PAGE                                      */
/* -------------------------------------------------------------------------- */

export default function RecruiterCampaignsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter || undefined,
      sort: sortBy,
      limit: 10,
    }),
    [search, statusFilter, sortBy]
  );

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRecruiterCampaigns(queryParams);

  const { data: totalCount, isLoading: loadingTotal } = useCampaignCount({});
  const { data: activeCount, isLoading: loadingActive } = useCampaignCount({ status: "active" });
  const { data: draftCount, isLoading: loadingDraft } = useCampaignCount({ status: "draft" });
  const { data: closedCount, isLoading: loadingClosed } = useCampaignCount({ status: "closed" });

  const campaigns = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  );

  const stats = [
    {
      icon: FolderKanban,
      value: totalCount?.count ?? 0,
      label: "Total Campaigns",
      tone: "text-foreground",
      loading: loadingTotal,
    },
    {
      icon: Users,
      value: activeCount?.count ?? 0,
      label: "Active Campaigns",
      tone: "text-accent",
      loading: loadingActive,
    },
    {
      icon: Calendar,
      value: draftCount?.count ?? 0,
      label: "Draft Campaigns",
      tone: "text-muted-foreground",
      loading: loadingDraft,
    },
    {
      icon: Briefcase,
      value: closedCount?.count ?? 0,
      label: "Completed",
      tone: "text-blue-400",
      loading: loadingClosed,
    },
  ];

  return (
    <div className="pb-24 md:pb-10">
      <main className="mx-auto w-full max-w-7xl px-4 pt-6 lg:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
              All Campaigns
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and track all your recruitment campaigns
            </p>
          </div>
          <Link href="/recruiter/campaigns/new">
            <Button className="gap-2 rounded-lg">
              <Plus className="h-4 w-4" /> Create Campaign
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
            : stats.map((s) => <StatCard key={s.label} {...s} />)}
        </section>

        {/* Filters */}
        <section className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "newest" | "oldest")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Campaign list */}
        <section className="mt-5 space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : campaigns.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                No campaigns found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {search || statusFilter
                  ? "Try adjusting your filters"
                  : "Create your first campaign to get started"}
              </p>
              {!search && !statusFilter && (
                <Link href="/recruiter/campaigns/new" className="mt-4 inline-block">
                  <Button size="sm" className="gap-2 rounded-lg">
                    <Plus className="h-4 w-4" /> Create Campaign
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            campaigns.map((c) => <CampaignCard key={c._id} campaign={c} />)
          )}
        </section>

        {/* Load more */}
        {hasNextPage && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="gap-2 rounded-lg"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </>
              ) : (
                "Show more"
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
