"use client";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bookmark,
  Clapperboard,
  Video,
  PersonStanding,
  Megaphone,
  Camera,
  Drama,
  Star,
  Film,
  Wifi,
} from "lucide-react";
import { useState, useCallback } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { useCampaigns, useCampaignCount, useBookmarkCampaign } from "@/hooks/use-campaigns";
import type { Campaign, QueryCampaignsParams } from "@/lib/api/campaigns";
import { Skeleton } from "@/components/ui/skeleton";

type Theme = "rose" | "blue" | "violet";

const roleIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  casting: Clapperboard,
  actor: Video,
  dancer: PersonStanding,
  influencer: Megaphone,
  model: Camera,
  musician: Drama,
  singer: Star,
};

const DefaultIcon = Film;

function RoleIcon({ roleType, className }: { roleType?: string; className?: string }) {
  const Icon = roleIconMap[roleType?.toLowerCase() ?? ""] ?? DefaultIcon;
  return <Icon className={className} />;
}

const roleThemeMap: Record<string, Theme> = {
  influencer: "blue",
  model: "violet",
};

function getRoleTheme(roleType?: string): Theme {
  if (!roleType) return "rose";
  return roleThemeMap[roleType.toLowerCase()] ?? "rose";
}

function formatDeadline(deadline?: string): string {
  if (!deadline) return "";
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs < 0) return "Closed";
  const days = Math.ceil(diffMs / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d left";
  if (days < 7) return days + "d left";
  if (days < 30) return Math.floor(days / 7) + "w left";
  return Math.floor(days / 30) + "mo left";
}

function formatLocation(location?: { city?: string; state?: string }): string {
  if (!location) return "Remote";
  return [location.city, location.state].filter(Boolean).join(", ") || "Remote";
}

function formatBudget(budget?: { min?: number; max?: number; currency?: string }): string {
  if (!budget) return "";
  const sym = budget.currency === "INR" ? "₹" : "$";
  if (budget.min && budget.max) return sym + budget.min.toLocaleString() + " – " + sym + budget.max.toLocaleString();
  if (budget.min) return "From " + sym + budget.min.toLocaleString();
  if (budget.max) return "Up to " + sym + budget.max.toLocaleString();
  return "";
}

function JobCardSkeleton() {
  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-2xl border border-border/50 bg-card p-4">
      <Skeleton className="h-[76px] w-[76px] rounded-2xl" />
      <div className="min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </article>
  );
}

const cardTheme: Record<Theme, string> = {
  rose: "border-rose/25 bg-gradient-to-br from-rose/20 to-transparent",
  blue: "border-blue/25 bg-gradient-to-br from-blue/20 to-transparent",
  violet: "border-purple/25 bg-gradient-to-br from-purple/20 to-transparent",
};

const iconTheme: Record<Theme, string> = {
  rose: "bg-rose/20 text-rose-foreground",
  blue: "bg-blue/25 text-foreground",
  violet: "bg-purple/25 text-foreground",
};

function JobCard({
  campaign,
  onBookmark,
  isBookmarking,
}: {
  campaign: Campaign;
  onBookmark: (id: string) => void;
  isBookmarking: boolean;
}) {
  const theme = getRoleTheme(campaign.role_type);

  return (
    <Link href={"/talent/opportunities/" + campaign._id}>
      <article
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-2xl border p-4 transition-colors hover:bg-accent/30",
          cardTheme[theme],
        )}
      >
        <div
          className={cn(
            "grid h-[76px] w-[76px] shrink-0 place-items-center rounded-2xl",
            iconTheme[theme],
          )}
        >
          <RoleIcon roleType={campaign.role_type} className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="rounded-md border border-border bg-background/40 px-2 py-0.5 text-xs font-medium">
                {campaign.role_type || "Campaign"}
              </span>
              <span className="flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                {campaign.visibility === "invite_only" ? (
                  <>
                    <Wifi className="h-3 w-3" /> Invite Only
                  </>
                ) : (
                  <>
                    <MapPin className="h-3 w-3" /> Open
                  </>
                )}
              </span>
            </div>
            <button
              aria-label="Save opportunity"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookmark(campaign._id);
              }}
              disabled={isBookmarking}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
          <h3 className="mt-2 truncate text-lg font-bold">{campaign.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {campaign.description || "No description provided."}
          </p>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-xs text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatLocation(campaign.location)}</span>
            </span>
            <span className="shrink-0">{formatDeadline(campaign.deadline)}</span>
          </div>
          {formatBudget(campaign.budget_range) && (
            <p className="mt-1 text-xs font-medium text-teal">{formatBudget(campaign.budget_range)}</p>
          )}
        </div>
      </article>
    </Link>
  );
}

const tabs = ["All", "Applied", "Saved"] as const;
const sortOptions = [
  { label: "Newest", value: "newest" as const },
  { label: "Oldest", value: "oldest" as const },
  { label: "Relevance", value: "relevance" as const },
];
const roleTypes = ["All", "Actor", "Model", "Dancer", "Influencer", "Musician", "Casting"];

export function OpportunitiesPage() {
  const [tab, setTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [roleType, setRoleType] = useState("");
  const [sort, setSort] = useState<"relevance" | "newest" | "oldest">("newest");
  const [page, setPage] = useState(1);

  const queryParams: QueryCampaignsParams = {
    status: "active",
    sort,
    page,
    limit: 12,
  };
  if (search) queryParams.search = search;
  if (roleType && roleType !== "All") queryParams.role_type = roleType;
  if (tab === "Applied") queryParams.applied = "true";

  const { data: campaigns, isLoading, isError } = useCampaigns(queryParams);
  const { data: countData } = useCampaignCount(queryParams);
  const bookmarkMutation = useBookmarkCampaign();

  const handleBookmark = useCallback(
    (id: string) => {
      bookmarkMutation.mutate({ id, bookmarked: false });
    },
    [bookmarkMutation],
  );

  const totalPages = countData?.count ? Math.ceil(countData.count / 12) : 1;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 pb-28 pt-5 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover roles that match your talent
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-card p-1 lg:max-w-2xl">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={cn(
              "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              tab === t
                ? "bg-gradient-teal text-accent-foreground"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3 lg:flex lg:items-center lg:gap-3 lg:space-y-0">
        <div className="flex items-center gap-3 lg:min-w-0 lg:flex-1">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              placeholder="Search by keyword, role, or location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="no-scrollbar flex items-center gap-3 overflow-x-auto">
          <select
            value={roleType}
            onChange={(e) => {
              setRoleType(e.target.value);
              setPage(1);
            }}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm hover:bg-accent"
          >
            {roleTypes.map((r) => (
              <option key={r} value={r === "All" ? "" : r}>
                {r === "All" ? "All Roles" : r}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm hover:bg-accent"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearch("");
              setRoleType("");
              setSort("newest");
              setPage(1);
            }}
            className="ml-auto shrink-0 text-sm font-medium text-teal lg:ml-2"
          >
            Clear
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load opportunities. Please try again later.
          </p>
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => (
            <JobCard
              key={c._id}
              campaign={c}
              onBookmark={handleBookmark}
              isBookmarking={bookmarkMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Film className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No opportunities found. Try adjusting your filters.
          </p>
        </div>
      )}

      {campaigns && campaigns.length > 0 && totalPages > 1 && (
        <div className="hidden grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 lg:grid">
          <p className="truncate text-sm text-muted-foreground">
            Showing {(page - 1) * 12 + 1} to{" "}
            {Math.min(page * 12, countData?.count ?? 0)} of{" "}
            {countData?.count ?? 0} opportunities
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-accent disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "min-w-9 rounded-lg border px-3 py-2 text-sm",
                    p === page
                      ? "border-transparent bg-gradient-teal font-semibold text-accent-foreground"
                      : "border-border hover:bg-accent",
                  )}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-accent disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
