"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { setFilterSheetOpen } from "@/hooks/use-filter-sheet";
import { motion } from "motion/react";
import {
  ArrowRight,
  FileText,
  Bookmark,
  MapPin,
  Calendar,
  Clock,
  Drama,
  Users,
  Crown,
  X,
  Film,
  Search,
  SlidersHorizontal,
  Grid2X2,
  Camera,
  Music2,
  Megaphone,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  campaignKeys,
  useCampaigns,
  useCampaignCount,
  useCampaignRecommendations,
  useBookmarks,
  useBookmarkCampaign,
} from "@/hooks/use-campaigns";
import type {
  Campaign,
  CampaignRecommendation,
  QueryCampaignsParams,
} from "@/lib/api/campaigns";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscoveryTabs } from "@/components/marketplace/discovery-tabs";
import { OpportunityFiltersSheet } from "./OpportunityFiltersSheet";
import { RecruiterSearchPanel } from "./RecruiterSearchPanel";
import { TalentServicesView } from "./TalentServicesView";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

interface FeedItem {
  id: string;
  name: string;
  description?: string;
  roleType?: string;
  recruiter?: Campaign["recruiter"];
  locationText: string;
  isRemote: boolean;
  gender?: string;
  ageRangeText?: string;
  languagesText?: string;
  budgetText?: string;
  budgetCurrency?: string;
  deadline?: string;
  createdAt: string;
  applicationsCount: number;
  coverImageUrl?: string;
  matchScore?: number;
  isBookmarked?: boolean;
  applied: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const TABS = [
  "For You",
  "All",
  "Casting",
  "Actor",
  "Model",
  "Dancer",
  "Influencer",
  "Musician",
] as const;

type TabKey = (typeof TABS)[number];

const ROLE_TAB_MAP: Partial<Record<TabKey, string>> = {
  Casting: "casting",
  Actor: "actor",
  Model: "model",
  Dancer: "dancer",
  Influencer: "influencer",
  Musician: "musician",
};

const OPPORTUNITY_FILTERS = [
  { label: "All", icon: Grid2X2 },
  { label: "Casting", icon: Drama },
  { label: "Actor", icon: Camera },
  { label: "Model", icon: Camera },
  { label: "Dancer", icon: Users },
  { label: "Influencer", icon: Megaphone },
  { label: "Musician", icon: Music2 },
];

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatLocation(location?: { city?: string; state?: string }): string {
  if (!location) return "Remote";
  return [location.city, location.state].filter(Boolean).join(", ") || "Remote";
}

function formatBudget(budget?: { min?: number; max?: number; currency?: string }): string {
  if (!budget) return "";
  const sym = budget.currency === "INR" ? "â‚¹" : "$";
  if (budget.min && budget.max) {
    return `${sym}${budget.min.toLocaleString()} â€“ ${sym}${budget.max.toLocaleString()}`;
  }
  if (budget.min) return `From ${sym}${budget.min.toLocaleString()}`;
  if (budget.max) return `Up to ${sym}${budget.max.toLocaleString()}`;
  return "";
}

function formatAgeRange(age?: { min?: number; max?: number }): string {
  if (!age) return "";
  if (age.min && age.max) return `${age.min}â€“${age.max} yrs`;
  if (age.min) return `${age.min}+ yrs`;
  if (age.max) return `Up to ${age.max} yrs`;
  return "";
}

function formatDeadline(deadline?: string): { text: string; urgent: boolean } {
  if (!deadline) return { text: "Open", urgent: false };
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs < 0) return { text: "Closed", urgent: false };
  const days = Math.ceil(diffMs / 86400000);
  if (days <= 1) return { text: "Ends in 12h", urgent: true };
  if (days < 7) return { text: `Ends in ${days} day${days === 1 ? "" : "s"}`, urgent: days <= 3 };
  if (days < 30) return { text: `Ends in ${Math.floor(days / 7)}w`, urgent: false };
  return { text: `Ends in ${Math.floor(days / 30)}mo`, urgent: false };
}

function isNewListing(createdAt?: string): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 7 * 86400000;
}

function fromCampaign(c: Campaign): FeedItem {
  return {
    id: c._id,
    name: c.name,
    description: c.description,
    roleType: c.role_type,
    recruiter: c.recruiter,
    locationText: formatLocation(c.location),
    isRemote: !c.location?.city,
    gender: c.requirements?.gender,
    ageRangeText: formatAgeRange(c.requirements?.age_range),
    languagesText: c.requirements?.languages?.join(", "),
    budgetText: formatBudget(c.budget_range),
    budgetCurrency: c.budget_range?.currency,
    deadline: c.deadline,
    createdAt: c.created_at,
    applicationsCount: c.applications_count ?? 0,
    coverImageUrl: c.cover_image_url,
    matchScore: undefined,
    isBookmarked: c.is_bookmarked,
    applied: !!c.my_application,
  };
}

function fromRecommendation(r: CampaignRecommendation): FeedItem {
  return {
    id: r._id,
    name: r.name,
    description: r.description,
    roleType: r.role_type,
    recruiter: r.recruiter,
    locationText: formatLocation(r.location),
    isRemote: !r.location?.city,
    gender: r.requirements?.gender,
    ageRangeText: formatAgeRange(r.requirements?.age_range),
    languagesText: r.requirements?.languages?.join(", "),
    budgetText: formatBudget(r.budget_range),
    budgetCurrency: r.budget_range?.currency,
    deadline: r.deadline,
    createdAt: r.created_at,
    applicationsCount: r.applications_count ?? 0,
    coverImageUrl: r.cover_image_url,
    matchScore: r.match_score,
    isBookmarked: undefined,
    applied: false,
  };
}

/* -------------------------------------------------------------------------- */
/*                                 SKELETONS                                  */
/* -------------------------------------------------------------------------- */

function CardSkeleton() {
  return (
    <div className="card-soft w-full overflow-hidden pb-0">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function FeedCardSkeleton() {
  return (
    <div className="card-soft p-4">
      <div className="flex gap-3">
        <Skeleton className="size-24 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="mt-3 h-px w-full" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  COMPONENTS                                */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  title,
  emoji,
  href,
  actionLabel = "View All",
}: {
  title: string;
  emoji?: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="truncate text-base font-extrabold tracking-tight">
        {title} {emoji}
      </h2>
      {href ? (
        <Link href={href} className="shrink-0 text-sm font-semibold text-brand">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function OpportunityCard({
  item,
  onBookmark,
  isBookmarking,
}: {
  item: FeedItem;
  onBookmark: (id: string, bookmarked: boolean) => void;
  isBookmarking: boolean;
}) {
  const deadline = formatDeadline(item.deadline);
  const tag = item.roleType ? item.roleType.toUpperCase() : "OPPORTUNITY";
  const tagTone =
    item.roleType === "actor" || item.roleType === "casting"
      ? "bg-brand text-brand-foreground"
      : item.roleType === "influencer"
        ? "bg-warning text-foreground"
        : item.roleType === "musician"
          ? "bg-info text-brand-foreground"
          : "bg-success text-brand-foreground";

  return (
    <article className="card-soft w-full overflow-hidden pb-3">
      <Link href={`/talent/opportunities/${item.id}`} className="block">
        <div className="relative grid h-32 place-items-center bg-muted text-xs font-medium text-muted-foreground">
          {item.coverImageUrl ? (
            <img
              src={item.coverImageUrl}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <Film className="size-9 text-muted-foreground" />
          )}
          <span
            className={cn(
              "absolute left-2 top-2 rounded-md px-2 py-1 text-[10px] font-bold tracking-wide",
              tagTone,
            )}
          >
            {tag}
          </span>
        </div>
        <div className="px-3 pt-3">
          <h3 className="truncate text-sm font-bold">{item.name}</h3>
          {item.recruiter?.company_name && (
            <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
              {item.recruiter.company_name}
            </p>
          )}
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {item.description || item.roleType}
          </p>
          <p className="mt-1.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" /> {item.locationText}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {item.matchScore != null && (
              <span className="rounded-md bg-success/12 px-2 py-1 text-[11px] font-semibold text-success">
                {Math.round(item.matchScore)}% Match
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {deadline.urgent ? "Very High" : "High"}
            </span>
          </div>
          <p
            className={cn(
              "mt-2 flex items-center gap-1 text-xs",
              deadline.urgent ? "font-semibold text-accent-pink" : "text-muted-foreground",
            )}
          >
            <Calendar className="size-3.5" /> {deadline.text}
          </p>
          <p className="mt-1 truncate text-xs font-semibold">
            {item.budgetText || "Budget not disclosed"}
          </p>
        </div>
      </Link>
      <div className="mt-3 flex items-center gap-2 px-3">
        <Link
          href={`/talent/opportunities/${item.id}`}
          className="h-9 flex-1 rounded-lg gradient-brand text-center text-sm font-semibold leading-9 text-brand-foreground"
        >
          Apply Now
        </Link>
        <button
          type="button"
          aria-label={item.isBookmarked ? "Remove bookmark" : "Save opportunity"}
          disabled={isBookmarking}
          onClick={(e) => {
            e.preventDefault();
            onBookmark(item.id, item.isBookmarked ?? false);
          }}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-primary",
            item.isBookmarked && "text-primary",
          )}
        >
          <Bookmark className={cn("size-4", item.isBookmarked && "fill-current")} />
        </button>
      </div>
    </article>
  );
}

function UrgentCard({ item }: { item: FeedItem }) {
  const deadline = formatDeadline(item.deadline);
  return (
    <article className="card-soft grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-3">
      <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-muted text-center text-[9px] leading-tight text-muted-foreground">
        {item.coverImageUrl ? (
          <img
            src={item.coverImageUrl}
            alt=""
            className="size-full rounded-xl object-cover"
            loading="lazy"
          />
        ) : (
          <Film className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wide text-accent-pink">URGENT</span>
          <h3 className="truncate text-sm font-bold">{item.name}</h3>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {item.recruiter?.company_name}
        </p>
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" /> {item.locationText}
        </p>
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">Budget</p>
            <p className="truncate text-sm font-bold">{item.budgetText || "Not disclosed"}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-accent-pink">
              <Clock className="size-3.5" /> {deadline.text}
            </p>
          </div>
          <Link
            href={`/talent/opportunities/${item.id}`}
            className="h-9 shrink-0 rounded-lg gradient-brand px-5 text-center text-sm font-semibold leading-9 text-brand-foreground"
          >
            Apply
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeedCard({
  item,
  onBookmark,
  isBookmarking,
}: {
  item: FeedItem;
  onBookmark: (id: string, bookmarked: boolean) => void;
  isBookmarking: boolean;
}) {
  const deadline = formatDeadline(item.deadline);
  const urgent = deadline.urgent && deadline.text !== "Closed";
  const isNew = !urgent && isNewListing(item.createdAt);

  const requirementBits = [item.gender, item.ageRangeText, item.languagesText]
    .filter(Boolean)
    .join(" Â· ");

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="card-soft p-4"
    >
      <Link href={`/talent/opportunities/${item.id}`} className="block">
        <div className="flex gap-3">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
            {item.coverImageUrl ? (
              <>
                <img
                  src={item.coverImageUrl}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </>
            ) : (
              <div className="flex size-full items-center justify-center bg-muted">
                <Film className="size-9 text-muted-foreground" />
              </div>
            )}
            {(urgent || isNew) && (
              <span
                className={cn(
                  "absolute left-1 top-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white",
                  urgent ? "bg-accent-pink" : "bg-violet",
                )}
              >
                {urgent ? "URGENT" : "NEW"}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="line-clamp-1 font-semibold leading-tight">{item.name}</h2>
                {item.description && (
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label={item.isBookmarked ? "Remove bookmark" : "Save opportunity"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBookmark(item.id, item.isBookmarked ?? false);
                }}
                disabled={isBookmarking}
                className={cn(
                  "shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-primary",
                  item.isBookmarked && "text-primary",
                )}
              >
                <Bookmark className={cn("size-5", item.isBookmarked && "fill-current")} />
              </button>
            </div>

            {item.recruiter?.company_name && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {item.recruiter.company_name}
              </p>
            )}
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {item.locationText}
              {item.isRemote && (
                <span className="rounded bg-surface-2 px-1 text-[10px] font-medium">Remote</span>
              )}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {item.matchScore != null && (
                <span className="rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-medium text-success">
                  {Math.round(item.matchScore)}% Match
                </span>
              )}
              {item.roleType && (
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium capitalize text-brand">
                  {item.roleType}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          {requirementBits && (
            <p className="flex items-center gap-1.5">
              <span className="truncate">{requirementBits}</span>
            </p>
          )}
          {item.budgetText && <p className="flex items-center gap-1.5">{item.budgetText}</p>}
          <div className="flex items-center justify-between pt-1">
            <span
              className={cn(
                "flex items-center gap-1.5 font-medium",
                urgent ? "text-accent-pink" : "text-muted-foreground",
              )}
            >
              <Clock className="size-3.5" /> {deadline.text}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" /> {item.applicationsCount} applicants
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-3 flex gap-3">
        <Link
          href={`/talent/opportunities/${item.id}`}
          className="flex-1 rounded-xl border border-primary/50 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          View Details
        </Link>
        {item.applied ? (
          <span className="flex flex-1 items-center justify-center rounded-xl bg-surface-2 py-2.5 text-sm font-semibold text-success">
            Applied
          </span>
        ) : (
          <Link
            href={`/talent/opportunities/${item.id}`}
            className="flex-1 rounded-xl bg-gradient-teal py-2.5 text-center text-sm font-semibold text-accent-foreground transition-all hover:brightness-110"
          >
            Apply Now
          </Link>
        )}
      </div>
    </motion.article>
  );
}

function EmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 text-center"
    >
      <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10">
        <Film className="size-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">No opportunities found</h3>
      <p className="mt-1 max-w-sm px-4 text-sm text-muted-foreground">
        Try adjusting your filters to discover more casting calls and creative roles.
      </p>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
        >
          Clear filters
        </button>
      ) : null}
    </motion.div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-destructive/10">
        <X className="size-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold">Failed to load opportunities</h3>
      <p className="mt-1 max-w-sm px-4 text-sm text-muted-foreground">
        Something went wrong while fetching listings. Please try again in a moment.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export function OpportunitiesPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const tab: TabKey = useMemo(() => {
    const t = searchParams?.get("tab");
    if (t && TABS.includes(t as TabKey)) return t as TabKey;
    return "For You";
  }, [searchParams]);

  const view = searchParams?.get("view");
  const isRecruiterView = view === "recruiters";
  const isServicesView = view === "services";

  const search = searchParams?.get("search") ?? "";
  const sort = (searchParams?.get("sort") ?? "relevance") as QueryCampaignsParams["sort"];
  const gender = searchParams?.get("gender") ?? undefined;
  const locationCity = searchParams?.get("location_city") ?? undefined;
  const skills = searchParams?.get("skills") ?? undefined;
  const languages = searchParams?.get("languages") ?? undefined;
  const bookmarked = searchParams?.get("bookmarked") === "true";

  const isForYou =
    tab === "For You" &&
    !isRecruiterView &&
    !isServicesView &&
    !search &&
    !gender &&
    !locationCity &&
    !skills &&
    !languages &&
    !bookmarked;

  const { data: bookmarks } = useBookmarks();
  const { data: recommendations, isLoading: recsLoading } = useCampaignRecommendations(10);
  const recentCampaignQuery = useCampaigns(
    { status: "active", sort: "newest", page: 1, limit: 6 },
    isForYou,
  );
  const bookmarkMutation = useBookmarkCampaign();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState(() => search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const [locationInput, setLocationInput] = useState(() => locationCity ?? "");
  const [syncedLocation, setSyncedLocation] = useState(locationCity ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [premiumBannerVisible, setPremiumBannerVisible] = useState(true);

  if (syncedSearch !== search) {
    setSyncedSearch(search);
    setSearchInput(search);
  }
  if (syncedLocation !== (locationCity ?? "")) {
    setSyncedLocation(locationCity ?? "");
    setLocationInput(locationCity ?? "");
  }

  useEffect(() => {
    setFilterSheetOpen(filtersOpen && !isRecruiterView && !isServicesView);
  }, [filtersOpen, isRecruiterView, isServicesView]);

  useEffect(() => {
    if (!searchParams) return;
    const timeout = setTimeout(() => {
      const nextSearch = searchInput.trim();
      const nextLocation = locationInput.trim();
      if (nextSearch === search && nextLocation === (locationCity ?? "")) return;
      const params = new URLSearchParams(searchParams.toString());
      if (nextSearch) params.set("search", nextSearch);
      else params.delete("search");
      if (nextLocation) params.set("location_city", nextLocation);
      else params.delete("location_city");
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput, search, locationInput, locationCity, pathname, router, searchParams]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      if (!searchParams) return;
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") params.delete(key);
        else params.set(key, value);
      });
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const queryParams: QueryCampaignsParams = useMemo(() => {
    const params: QueryCampaignsParams = {
      status: "active",
      sort: sort || "relevance",
      page: 1,
      limit: 50,
    };
    const role = ROLE_TAB_MAP[tab];
    if (role) params.role_type = role;
    if (search.trim()) params.search = search.trim();
    if (gender) params.gender = gender;
    if (locationCity) params.location_city = locationCity;
    if (skills) params.skills = skills;
    if (languages) params.languages = languages;
    return params;
  }, [tab, search, sort, gender, locationCity, skills, languages]);

  const { data: campaigns, isLoading, isError } = useCampaigns(
    queryParams,
    !isForYou && !isServicesView,
  );
  const { data: campaignCount } = useCampaignCount(
    queryParams,
    !isForYou && !isServicesView,
  );

  const bookmarkIds = useMemo(
    () => new Set((bookmarks ?? []).map((b) => b._id)),
    [bookmarks],
  );

  const items: FeedItem[] = useMemo(() => {
    const source = isForYou
      ? (recommendations ?? []).map(fromRecommendation)
      : (campaigns ?? []).map(fromCampaign);
    return source.map((item) => ({
      ...item,
      isBookmarked: bookmarkIds.has(item.id) || item.isBookmarked,
    }));
  }, [isForYou, recommendations, campaigns, bookmarkIds]);
  const recentItems = useMemo(
    () => (recentCampaignQuery.data ?? []).map(fromCampaign),
    [recentCampaignQuery.data],
  );

  const displayedItems = useMemo(() => {
    if (!bookmarked) return items;
    return items.filter((item) => item.isBookmarked);
  }, [items, bookmarked]);

  const loading = isForYou ? recsLoading : isLoading;

  const handleBookmark = useCallback(
    (id: string, bookmarked: boolean) => {
      bookmarkMutation.mutate(
        { id, bookmarked },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: campaignKeys.bookmarks() });
            queryClient.invalidateQueries({ queryKey: campaignKeys.recommendations(10) });
            queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
          },
        },
      );
    },
    [bookmarkMutation, queryClient],
  );

  const urgentItems = useMemo(() => {
    const source = isForYou
      ? (recommendations ?? []).map(fromRecommendation)
      : items;
    return source.filter((i) => {
      const d = formatDeadline(i.deadline);
      return d.urgent && d.text !== "Closed";
    });
  }, [isForYou, recommendations, items]);

  const activeChips = useMemo(() => {
    const chips: { label: string; remove: () => void }[] = [];
    if (tab && tab !== "For You" && tab !== "All") {
      chips.push({ label: tab, remove: () => updateParams({ tab: "All" }) });
    }
    if (search)
      chips.push({
        label: search,
        remove: () => {
          setSearchInput("");
          updateParams({ search: null });
        },
      });
    if (gender)
      chips.push({
        label: gender.charAt(0).toUpperCase() + gender.slice(1),
        remove: () => updateParams({ gender: null }),
      });
    if (locationCity)
      chips.push({ label: locationCity, remove: () => updateParams({ location_city: null }) });
    if (skills)
      chips.push({ label: `Skills: ${skills}`, remove: () => updateParams({ skills: null }) });
    if (languages)
      chips.push({
        label: `Languages: ${languages}`,
        remove: () => updateParams({ languages: null }),
      });
    if (sort && sort !== "relevance")
      chips.push({ label: `Sort: ${sort}`, remove: () => updateParams({ sort: null }) });
    if (bookmarked)
      chips.push({ label: "Saved", remove: () => updateParams({ bookmarked: null }) });
    return chips;
  }, [tab, search, gender, locationCity, skills, languages, sort, bookmarked, updateParams]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 pb-24 font-sans">
      <section
        className="relative mx-4 isolate overflow-hidden rounded-3xl bg-[#0a0827] bg-cover bg-[65%_center] bg-no-repeat text-white shadow-sm sm:bg-right"
        style={{
          backgroundImage: `url(${isRecruiterView ? "/images/landing/morporfile-recruiter-banner.webp" : "/images/landing/morporfile-opportunity-banner.webp"})`,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a0827]/95 via-[#0a0827]/80 to-[#0a0827]/20 sm:via-[#0a0827]/65 sm:to-transparent"
        />
        <div className="relative z-10 flex min-h-36 items-stretch sm:min-h-56">
          <div className="flex w-full max-w-2xl flex-col justify-center px-5 py-4 sm:w-[65%] sm:px-8 sm:py-8 lg:px-10">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-200 sm:text-xs sm:tracking-[0.2em]">
              Morporfile creative network / {isRecruiterView ? "companies" : isServicesView ? "marketplace" : "opportunities"}
            </p>
            <h1 className="mt-2 text-xl font-bold leading-tight sm:mt-3 sm:text-3xl md:text-4xl">
              {isRecruiterView ? (
                <>Discover <span className="text-fuchsia-300">recruiters</span> and companies</>
              ) : isServicesView ? (
                <>Find <span className="text-fuchsia-300">creative services</span> for your project</>
              ) : (
                <>Find the best <span className="text-fuchsia-300">opportunities</span> for your talent</>
              )}
            </h1>
            <p className="mt-1.5 max-w-xl text-[11px] leading-relaxed text-white/80 sm:mt-2 sm:text-sm md:text-base">
              {isRecruiterView
                ? "Connect with production houses, agencies, and creative brands."
                : isServicesView
                  ? "Discover trusted creative professionals and services for your next project."
                : "Explore auditions, casting calls, projects, and creative roles."}
            </p>
            {!isRecruiterView && !isServicesView && (
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="mt-3 w-fit gap-1.5 rounded-full bg-white/95 text-[#542094] shadow-sm hover:bg-white"
              >
                <Link href="/talent/applications">
                  <FileText className="size-4" />
                  My Applications
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="mx-4">
        <DiscoveryTabs searchTerm={searchInput} />
      </div>

      {isServicesView ? (
        <TalentServicesView initialSearch={search} />
      ) : (
        <>
          {!isRecruiterView && (
        <Card className="mx-4 gap-0 rounded-3xl border-border/60 bg-card py-0 shadow-[0_8px_24px_rgba(27,16,56,0.07)]">
          <CardContent className="space-y-3.5 p-3.5 sm:p-5">
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search opportunities, e.g. web series, ad, model"
                  aria-label="Search campaigns"
                  className="h-11 rounded-xl border-border/70 bg-background pl-10 pr-3 text-sm shadow-[0_2px_8px_rgba(27,16,56,0.04)]"
                />
              </div>
              <Button
                type="button"
                size="icon"
                aria-label="Open campaign filters"
                onClick={() => setFiltersOpen(true)}
                className="size-11 shrink-0 rounded-xl bg-gradient-to-r from-[#9d1fe8] to-[#7212c7] text-white shadow-[0_4px_12px_rgba(126,19,205,0.22)] hover:brightness-105"
              >
                <SlidersHorizontal className="size-5" />
              </Button>
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Browse opportunity categories">
              {OPPORTUNITY_FILTERS.map(({ label, icon: Icon }) => {
                const selected = label === "All"
                  ? tab === "For You" || tab === "All"
                  : tab === label;
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => updateParams({ tab: label === "All" ? "All" : label })}
                    className={`flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-1.5 text-center text-[10px] font-semibold leading-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8614df] focus-visible:ring-offset-2 ${
                      selected
                        ? "border-[#8614df] bg-gradient-to-b from-[#a529f3] to-[#7410c9] text-white shadow-[0_5px_12px_rgba(126,19,205,0.25)]"
                        : "border-[#eee7f6] bg-gradient-to-b from-white to-[#faf7fd] text-[#494257] shadow-[0_2px_6px_rgba(27,16,56,0.05)] hover:border-[#d8c0f1] hover:text-[#7410c9]"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
              <div className="relative w-[126px] shrink-0">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={locationInput}
                  onChange={(event) => setLocationInput(event.target.value)}
                  placeholder="Location"
                  aria-label="Location"
                  className="h-9 rounded-full border-border/70 bg-background pl-8 pr-2 text-xs shadow-[0_2px_6px_rgba(27,16,56,0.04)]"
                />
              </div>
              <Select
                value={gender ?? "any"}
                onValueChange={(value) => updateParams({ gender: value === "any" ? null : value })}
              >
                <SelectTrigger aria-label="Gender" className="h-9 w-[126px] shrink-0 rounded-full border-border/70 bg-background px-3 text-xs shadow-[0_2px_6px_rgba(27,16,56,0.04)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any gender</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sort ?? "relevance"}
                onValueChange={(value) => updateParams({ sort: value === "relevance" ? null : value })}
              >
                <SelectTrigger aria-label="Sort results" className="h-9 w-[138px] shrink-0 rounded-full border-border/70 bg-background px-3 text-xs shadow-[0_2px_6px_rgba(27,16,56,0.04)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Best match</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
          )}

      {isRecruiterView && (
        <RecruiterSearchPanel
          input={searchInput}
          onSearchChange={setSearchInput}
          search={search}
        />
      )}

      {/* Top opportunities */}
      {isForYou && (
        <section className="mt-6">
          <div className="px-4">
            <SectionHeader title="Featured & recommended campaigns" emoji="âœ¨" href="?tab=All" />
          </div>
            <div className="grid gap-3 px-4 pb-1 sm:grid-cols-2 xl:grid-cols-3">
            {recsLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : items.length > 0 ? (
              items.map((item) => (
                <OpportunityCard
                  key={item.id}
                  item={item}
                  onBookmark={handleBookmark}
                  isBookmarking={bookmarkMutation.isPending}
                />
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                Campaign recommendations will appear here as they become available.
              </p>
            )}
          </div>
        </section>
      )}

      {isForYou && (
        <section className="mt-8 px-4">
          <SectionHeader title="Recently added campaigns" href="?tab=All" />
          {recentCampaignQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : recentCampaignQuery.isError ? (
            <ErrorState />
          ) : recentItems.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recentItems.map((item) => (
                <OpportunityCard
                  key={item.id}
                  item={item}
                  onBookmark={handleBookmark}
                  isBookmarking={bookmarkMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              New campaigns will appear here as soon as they are posted.
            </p>
          )}
        </section>
      )}

      {/* Filtered search/list layout */}
      {!isForYou && !isRecruiterView && (
        <section className="mt-2 px-4">
          {/* Result bar */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <h3 className="truncate text-base font-extrabold tracking-tight">
              {bookmarked
                ? `${displayedItems.length} saved`
                : `${campaignCount?.count ?? items.length} opportunities`}
            </h3>
          </div>

          {/* Active chips */}
          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={chip.remove}
                    aria-label={`Remove ${chip.label}`}
                    className="rounded-full hover:text-accent-pink"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  const params = new URLSearchParams();
                  params.set("tab", "All");
                  router.push(`${pathname}?${params.toString()}`);
                }}
                className="text-xs font-semibold text-accent-pink"
              >
                Clear
              </button>
            </div>
          )}

          {/* List */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <FeedCardSkeleton key={i} />)
            ) : isError ? (
              <div className="sm:col-span-2 xl:col-span-3"><ErrorState /></div>
            ) : displayedItems.length > 0 ? (
              displayedItems.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  onBookmark={handleBookmark}
                  isBookmarking={bookmarkMutation.isPending}
                />
              ))
            ) : (
              <div className="sm:col-span-2 xl:col-span-3">
                <EmptyState
                  onClear={() => {
                    setSearchInput("");
                    const params = new URLSearchParams();
                    params.set("tab", "All");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}

      <OpportunityFiltersSheet
        key={searchParams?.toString() ?? "filters"}
        open={filtersOpen && !isRecruiterView}
        onClose={() => setFiltersOpen(false)}
      />

      {/* Urgent hiring */}
      {isForYou && (
        <section className="mt-6 px-4">
          <SectionHeader title="Urgent Hiring Near You" />
          <div className="space-y-3">
            {urgentItems.length > 0 ? (
              urgentItems.map((item) => <UrgentCard key={item.id} item={item} />)
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                No urgent opportunities right now.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Premium banner */}
      {isForYou && premiumBannerVisible && (
        <section className="mt-6 px-4">
          <div className="relative overflow-hidden rounded-2xl gradient-brand p-4 text-brand-foreground">
            <Button
              type="button"
              onClick={() => setPremiumBannerVisible(false)}
              aria-label="Dismiss Premium Talent banner"
              variant="ghost"
              size="icon-sm"
              className="absolute right-3 top-3 text-brand-foreground/80 hover:bg-brand-foreground/10 hover:text-brand-foreground"
            >
              <X className="size-4" />
            </Button>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-extrabold">Premium Talent</h3>
              <Crown className="size-4" />
            </div>
            <p className="mt-1 max-w-[85%] text-sm text-brand-foreground/85">
              Get 5x more visibility and priority access to exclusive opportunities.
            </p>
            <Link
              href="/talent/billing"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-card px-4 py-2 text-sm font-semibold text-brand"
            >
              Upgrade Now <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}

      <section className="mx-4 mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-base font-bold">Looking for creative professionals?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Find photographers, studios, editors, and more in Services.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/services">
            Explore Services <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </section>
        </>
      )}
    </div>
  );
}
