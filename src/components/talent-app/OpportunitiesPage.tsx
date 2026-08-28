"use client";

import {
  Search,
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
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ArrowRight,
  Clock,
  Users,
  IndianRupee,
  DollarSign,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import { useCampaigns, useCampaignCount, useBookmarkCampaign } from "@/hooks/use-campaigns";
import type { Campaign, QueryCampaignsParams } from "@/lib/api/campaigns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

type ViewMode = "grid" | "list";
type Theme = "rose" | "blue" | "violet" | "amber" | "cyan";

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
  actor: "rose",
  dancer: "amber",
  influencer: "blue",
  model: "violet",
  musician: "cyan",
  singer: "cyan",
  casting: "rose",
};

function getRoleTheme(roleType?: string): Theme {
  if (!roleType) return "rose";
  return roleThemeMap[roleType.toLowerCase()] ?? "rose";
}

const themeStyles: Record<
  Theme,
  { gradient: string; iconBg: string; iconText: string; badge: string }
> = {
  rose: {
    gradient: "from-rose/30 via-rose/10 to-transparent",
    iconBg: "bg-rose/15",
    iconText: "text-rose",
    badge: "border-rose/30 text-rose bg-rose/10",
  },
  blue: {
    gradient: "from-blue/30 via-blue/10 to-transparent",
    iconBg: "bg-blue/15",
    iconText: "text-blue",
    badge: "border-blue/30 text-blue bg-blue/10",
  },
  violet: {
    gradient: "from-violet/30 via-violet/10 to-transparent",
    iconBg: "bg-violet/15",
    iconText: "text-violet",
    badge: "border-violet/30 text-violet bg-violet/10",
  },
  amber: {
    gradient: "from-warning/30 via-warning/10 to-transparent",
    iconBg: "bg-warning/15",
    iconText: "text-warning",
    badge: "border-warning/30 text-warning bg-warning/10",
  },
  cyan: {
    gradient: "from-cyan/30 via-cyan/10 to-transparent",
    iconBg: "bg-cyan/15",
    iconText: "text-cyan",
    badge: "border-cyan/30 text-cyan bg-cyan/10",
  },
};

function formatDeadline(deadline?: string): { text: string; urgent: boolean } {
  if (!deadline) return { text: "", urgent: false };
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs < 0) return { text: "Closed", urgent: false };
  const days = Math.ceil(diffMs / 86400000);
  if (days === 0) return { text: "Today", urgent: true };
  if (days === 1) return { text: "1d left", urgent: true };
  if (days < 7) return { text: `${days}d left`, urgent: days <= 3 };
  if (days < 30) return { text: `${Math.floor(days / 7)}w left`, urgent: false };
  return { text: `${Math.floor(days / 30)}mo left`, urgent: false };
}

function formatLocation(location?: { city?: string; state?: string }): string {
  if (!location) return "Remote";
  return [location.city, location.state].filter(Boolean).join(", ") || "Remote";
}

function formatBudget(budget?: { min?: number; max?: number; currency?: string }): string {
  if (!budget) return "";
  const isInr = budget.currency === "INR";
  const sym = isInr ? "₹" : "$";
  if (budget.min && budget.max) {
    return `${sym}${budget.min.toLocaleString()} – ${sym}${budget.max.toLocaleString()}`;
  }
  if (budget.min) return `From ${sym}${budget.min.toLocaleString()}`;
  if (budget.max) return `Up to ${sym}${budget.max.toLocaleString()}`;
  return "";
}

function formatApplicants(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function recruiterInitials(name?: string): string {
  if (!name) return "R";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const tabs = ["All", "Applied", "Saved"] as const;
const sortOptions = [
  { label: "Newest", value: "newest" as const },
  { label: "Oldest", value: "oldest" as const },
  { label: "Relevance", value: "relevance" as const },
];
const roleTypes = ["All", "Actor", "Model", "Dancer", "Influencer", "Musician", "Casting"];

/* -------------------------------------------------------------------------- */
/*                                    SKELETONS                               */
/* -------------------------------------------------------------------------- */

function GridCardSkeleton() {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

function ListCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-4">
      <Skeleton className="size-24 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-4 pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="hidden h-9 w-28 shrink-0 rounded-lg sm:block" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  CARDS                                     */
/* -------------------------------------------------------------------------- */

function OpportunityCard({
  campaign,
  onBookmark,
  isBookmarking,
  viewMode,
}: {
  campaign: Campaign;
  onBookmark: (campaign: Campaign) => void;
  isBookmarking: boolean;
  viewMode: ViewMode;
}) {
  const theme = getRoleTheme(campaign.role_type);
  const style = themeStyles[theme];
  const deadline = formatDeadline(campaign.deadline);
  const budget = formatBudget(campaign.budget_range);
  const location = formatLocation(campaign.location);
  const hasCover = !!campaign.cover_image_url;
  const isInviteOnly = campaign.visibility === "invite_only";
  const recruiterName = campaign.recruiter?.company_name || "Recruiter";

  const cardContent = (
    <>
      {/* Cover / Header */}
      <div
        className={cn(
          "relative overflow-hidden",
          viewMode === "grid" ? "aspect-[16/10] w-full" : "hidden sm:block sm:size-28 sm:shrink-0 sm:rounded-xl",
        )}
      >
        {hasCover ? (
          <>
            <img
              src={campaign.cover_image_url}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
          </>
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center bg-gradient-to-br",
              style.gradient,
            )}
          >
            <RoleIcon roleType={campaign.role_type} className={cn("h-12 w-12", style.iconText)} />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase tracking-wider", style.badge)}>
            {campaign.role_type || "Campaign"}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 text-[10px] font-semibold uppercase tracking-wider",
              isInviteOnly
                ? "border-gold/30 bg-gold/10 text-gold"
                : "border-border/60 bg-background/60 text-muted-foreground backdrop-blur-sm",
            )}
          >
            {isInviteOnly ? <Wifi className="h-2.5 w-2.5" /> : <MapPin className="h-2.5 w-2.5" />}
            {isInviteOnly ? "Invite Only" : "Open"}
          </Badge>
        </div>

        {/* Bookmark */}
        <button
          aria-label={campaign.is_bookmarked ? "Remove bookmark" : "Save opportunity"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookmark(campaign);
              }}
          disabled={isBookmarking}
          className={cn(
            "absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60",
            campaign.is_bookmarked && "bg-primary text-primary-foreground hover:bg-primary",
          )}
        >
          <Bookmark className={cn("h-4 w-4", campaign.is_bookmarked && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <div className={cn("flex flex-col", viewMode === "grid" ? "p-4" : "flex-1 p-0 py-1 pr-2")}>
        <h3
          className={cn(
            "line-clamp-1 font-semibold tracking-tight transition-colors group-hover:text-primary",
            viewMode === "grid" ? "text-base" : "text-base sm:text-lg",
          )}
        >
          {campaign.name}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {campaign.description || "No description provided."}
        </p>

        {/* Recruiter */}
        <div className="mt-3 flex items-center gap-2">
          <Avatar size="sm">
            <AvatarImage src={campaign.recruiter?.profile_photo} alt={recruiterName} />
            <AvatarFallback className="bg-surface-2 text-xs font-medium">
              {recruiterInitials(recruiterName)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-xs font-medium text-text-secondary">{recruiterName}</span>
        </div>

        {/* Metadata */}
        <div
          className={cn(
            "mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
            viewMode === "list" && "sm:flex-nowrap",
          )}
        >
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[120px] sm:max-w-none">{location}</span>
          </span>
          <span className={cn("flex items-center gap-1", deadline.urgent && "text-orange")}>
            <Clock className="h-3 w-3" />
            {deadline.text || "Open"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {formatApplicants(campaign.applications_count)} applicants
          </span>
          {budget && (
            <span className="flex items-center gap-1 font-medium text-green">
              {campaign.budget_range?.currency === "INR" ? (
                <IndianRupee className="h-3 w-3" />
              ) : (
                <DollarSign className="h-3 w-3" />
              )}
              {budget.replace(/[₹$]/g, "")}
            </span>
          )}
        </div>
      </div>

      {viewMode === "list" && (
        <div className="hidden shrink-0 items-center self-center sm:flex">
          <Button
            size="sm"
            className="gap-1.5 rounded-lg bg-gradient-teal font-semibold text-accent-foreground hover:brightness-110"
          >
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </>
  );

  return (
    <Link href={`/talent/opportunities/${campaign._id}`} className="block">
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-border-hover hover:shadow-card-lift",
          viewMode === "list" && "flex gap-4 p-3 sm:p-4",
        )}
      >
        {cardContent}
      </motion.article>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    EMPTY                                   */
/* -------------------------------------------------------------------------- */

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 text-center"
    >
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
        <Film className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">No opportunities found</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try adjusting your search or filters to discover more casting calls and creative roles.
      </p>
      <Button onClick={onClear} variant="outline" className="mt-5 rounded-lg">
        Clear all filters
      </Button>
    </motion.div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10">
        <Wifi className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold">Failed to load opportunities</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Something went wrong while fetching listings. Please try again in a moment.
      </p>
    </div>
  );
}

function useStickyStuck(topOffset = 64) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: `-${topOffset}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [topOffset]);

  return { sentinelRef, stuck };
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export function OpportunitiesPage() {
  const [tab, setTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [roleType, setRoleType] = useState("");
  const [sort, setSort] = useState<"relevance" | "newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
    (campaign: Campaign) => {
      bookmarkMutation.mutate({ id: campaign._id, bookmarked: campaign.is_bookmarked ?? false });
    },
    [bookmarkMutation],
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setRoleType("");
    setSort("newest");
    setTab("All");
    setPage(1);
  }, []);

  const totalCount = countData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / 12));
  const startItem = totalCount === 0 ? 0 : (page - 1) * 12 + 1;
  const endItem = Math.min(page * 12, totalCount);

  const hasActiveFilters = search || roleType || sort !== "newest" || tab !== "All";

  const { sentinelRef, stuck: controlsStuck } = useStickyStuck();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-28 pt-4 md:pt-6 lg:px-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan/10 blur-3xl" />
        <div className="relative z-10">
          <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/10 text-primary">
            Casting Calls & Gigs
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Discover your next role</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Browse casting calls, modeling gigs, and creative opportunities matched to your talent.
          </p>
        </div>
      </motion.div>

      {/* Sticky Search & Filter Controls */}
      <div className="relative">
        <div ref={sentinelRef} aria-hidden="true" className="absolute inset-x-0 top-0 h-px" />
        <div
          className={cn(
            "sticky top-16 z-40 -mx-4 px-4 transition-all duration-300 lg:-mx-6 lg:px-6",
            controlsStuck
              ? "border-b border-border/60 bg-background/80 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl"
              : "border-b border-transparent",
          )}
        >
          <div className="flex flex-col gap-3 py-3 md:py-3.5">
            {/* Search Row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/90 px-4 py-2.5 shadow-[var(--shadow-search)] transition-all duration-200 focus-within:border-primary/50 focus-within:bg-card focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-focus-within:bg-primary group-focus-within:text-primary-foreground">
                  <Search className="h-[18px] w-[18px]" />
                </div>
                <Input
                  placeholder="Search roles, keywords, or locations..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-auto flex-1 border-0 bg-transparent px-0 py-0.5 text-[15px] font-medium shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
                />
                {search && (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted/80 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Filters Row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2.5"
            >
              {/* Filter label */}
              <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-2.5 py-1.5 text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-widest">Filter</span>
              </div>

              {/* Role type chips */}
              <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
                {roleTypes.map((r) => {
                  const value = r === "All" ? "" : r;
                  const active = roleType === value;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        setRoleType(value);
                        setPage(1);
                      }}
                      className={cn(
                        "relative shrink-0 rounded-full px-3.5 py-[7px] text-[13px] font-medium transition-all duration-200",
                        active
                          ? "bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.5)]"
                          : "border border-border/60 bg-card/60 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground",
                      )}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value as typeof sort)}
                >
                  <SelectTrigger className="h-9 w-[120px] rounded-xl border-border/60 bg-card/60 text-xs font-medium sm:w-[130px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View toggle */}
                <div className="flex items-center rounded-xl border border-border/60 bg-card/60 p-[3px]">
                  <button
                    aria-label="Grid view"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "grid size-[30px] place-items-center rounded-[10px] transition-all duration-200",
                      viewMode === "grid"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="List view"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "grid size-[30px] place-items-center rounded-[10px] transition-all duration-200",
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {hasActiveFilters && (
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={clearFilters}
                    className="flex h-9 items-center gap-1 rounded-xl border border-border/60 bg-card/60 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs & Results Count */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                tab === t
                  ? "bg-gradient-teal text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {!isLoading && campaigns && campaigns.length > 0 ? (
            <>
              Showing <span className="font-medium text-foreground">{startItem}</span>–
              <span className="font-medium text-foreground">{endItem}</span> of{" "}
              <span className="font-medium text-foreground">{totalCount}</span> opportunities
            </>
          ) : (
            <>&nbsp;</>
          )}
        </p>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "grid gap-4",
              viewMode === "grid" ? "lg:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3",
            )}
          >
            {Array.from({ length: 6 }).map((_, i) =>
              viewMode === "grid" ? <GridCardSkeleton key={i} /> : <ListCardSkeleton key={i} />,
            )}
          </motion.div>
        ) : isError ? (
          <ErrorState />
        ) : campaigns && campaigns.length > 0 ? (
          <motion.div
            key={`${viewMode}-${page}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className={cn(
              viewMode === "grid" ? "grid gap-4 lg:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3",
            )}
          >
            {campaigns.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <OpportunityCard
                  campaign={c}
                  onBookmark={handleBookmark}
                  isBookmarking={bookmarkMutation.isPending}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState onClear={clearFilters} />
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!isLoading && campaigns && campaigns.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-between"
        >
          <p className="text-xs text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  className={cn(page === 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                    className={cn(
                      p === page &&
                        "border-transparent bg-gradient-teal font-semibold text-accent-foreground hover:bg-gradient-teal",
                    )}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {totalPages > 5 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className={cn(page === totalPages && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      )}
    </div>
  );
}
