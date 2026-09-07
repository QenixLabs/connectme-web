"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { setFilterSheetOpen } from "@/hooks/use-filter-sheet";
import { motion } from "motion/react";
import {
  Bell,
  MessageCircle,
  Info,
  ArrowRight,
  FileText,
  CalendarDays,
  Bookmark,
  Briefcase,
  Eye,
  MapPin,
  Calendar,
  Clock,
  Drama,
  Mic,
  Handshake,
  Users,
  Clapperboard,
  Crown,
  X,
  Film,
  Search,
  SlidersHorizontal,
  Target,
  Timer,
  Sparkles,
  Navigation,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  campaignKeys,
  useCampaigns,
  useCampaignCount,
  useCampaignRecommendations,
  useBookmarks,
  useBookmarkCampaign,
} from "@/hooks/use-campaigns";
import {
  useTalentProfile,
  useTalentApplicationStats,
} from "@/hooks/use-talent-dashboard";
import type {
  Campaign,
  CampaignRecommendation,
  QueryCampaignsParams,
} from "@/lib/api/campaigns";
import { Skeleton } from "@/components/ui/skeleton";
import { OpportunityFiltersSheet } from "./OpportunityFiltersSheet";

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

const categories = [
  { icon: Drama, label: "Casting Calls", tone: "bg-brand-soft text-brand", href: "?tab=Casting" },
  { icon: Briefcase, label: "Jobs", tone: "bg-info/12 text-info", href: "?tab=All" },
  { icon: Mic, label: "Auditions", tone: "bg-accent-pink/10 text-accent-pink", href: "?tab=Actor" },
  { icon: Handshake, label: "Brand Deals", tone: "bg-warning/15 text-warning", href: "?tab=Influencer" },
  { icon: Users, label: "Collab", tone: "bg-success/12 text-success", href: "?tab=All" },
  { icon: Clapperboard, label: "Projects", tone: "bg-brand-soft text-brand", href: "?tab=All" },
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
  const sym = budget.currency === "INR" ? "₹" : "$";
  if (budget.min && budget.max) {
    return `${sym}${budget.min.toLocaleString()} – ${sym}${budget.max.toLocaleString()}`;
  }
  if (budget.min) return `From ${sym}${budget.min.toLocaleString()}`;
  if (budget.max) return `Up to ${sym}${budget.max.toLocaleString()}`;
  return "";
}

function formatAgeRange(age?: { min?: number; max?: number }): string {
  if (!age) return "";
  if (age.min && age.max) return `${age.min}–${age.max} yrs`;
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

function getInitials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function greetingForHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function scoreLabel(score?: number): string {
  if (score == null) return "Not scored";
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Average";
}

/* -------------------------------------------------------------------------- */
/*                                 SKELETONS                                  */
/* -------------------------------------------------------------------------- */

function CardSkeleton() {
  return (
    <div className="card-soft w-64 shrink-0 overflow-hidden pb-0">
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
    <article className="card-soft w-64 shrink-0 snap-start overflow-hidden pb-3">
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
            "Image placeholder"
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
          "Image"
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
    .join(" · ");

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

  const search = searchParams?.get("search") ?? "";
  const sort = (searchParams?.get("sort") ?? "relevance") as QueryCampaignsParams["sort"];
  const gender = searchParams?.get("gender") ?? undefined;
  const locationCity = searchParams?.get("location_city") ?? undefined;
  const skills = searchParams?.get("skills") ?? undefined;
  const languages = searchParams?.get("languages") ?? undefined;
  const bookmarked = searchParams?.get("bookmarked") === "true";

  const isForYou = tab === "For You";

  const { data: profile } = useTalentProfile();
  const { data: appStats } = useTalentApplicationStats();
  const { data: bookmarks } = useBookmarks();
  const { data: recommendations, isLoading: recsLoading } = useCampaignRecommendations(10);
  const bookmarkMutation = useBookmarkCampaign();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState(() => search);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setFilterSheetOpen(filtersOpen);
  }, [filtersOpen]);

  useEffect(() => {
    if (!searchParams) return;
    const timeout = setTimeout(() => {
      if (searchInput === search) return;
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput.trim()) params.set("search", searchInput.trim());
      else params.delete("search");
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput, search, pathname, router, searchParams]);

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

  const { data: campaigns, isLoading, isError } = useCampaigns(queryParams, !isForYou);
  const { data: campaignCount } = useCampaignCount(queryParams, !isForYou);

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

  const profileName = profile?.full_legal_name || profile?.username || "Talent";
  const initials = getInitials(profileName);
  const trustScore = profile?.trust_score;
  const profileViews = profile?.analytics?.profile_views_7d ?? 0;

  const stats = [
    {
      icon: FileText,
      label: "My Applications",
      value: String(appStats?.applied ?? 0),
      tone: "bg-brand-soft text-brand",
      href: "/talent/applications",
    },
    {
      icon: CalendarDays,
      label: "Auditions",
      value: String(appStats?.auditions ?? 0),
      tone: "bg-accent-pink/10 text-accent-pink",
      href: "/talent/applications",
    },
    {
      icon: Bookmark,
      label: "Saved",
      value: String(bookmarks?.length ?? 0),
      tone: "bg-warning/15 text-warning",
      href: "/talent/opportunities?tab=All&bookmarked=true",
    },
    {
      icon: Eye,
      label: "Profile Views",
      value: String(profileViews),
      tone: "bg-success/12 text-success",
      href: "/talent/profile",
    },
  ];

  const urgentItems = useMemo(() => {
    const source = isForYou
      ? (recommendations ?? []).map(fromRecommendation)
      : items;
    return source.filter((i) => {
      const d = formatDeadline(i.deadline);
      return d.urgent && d.text !== "Closed";
    });
  }, [isForYou, recommendations, items]);

  const profileCity = profile?.location?.city?.toLowerCase();

  const quickStats = useMemo(() => {
    const highlyMatched = (recommendations ?? []).filter(
      (r) => (r.match_score ?? 0) >= 80,
    ).length;
    const closingSoon = displayedItems.filter((i) => {
      const d = formatDeadline(i.deadline);
      return d.urgent && d.text !== "Closed";
    }).length;
    const nearYou = displayedItems.filter((i) => {
      const city = i.locationText.split(",")[0]?.trim().toLowerCase();
      return !!profileCity && city === profileCity;
    }).length;
    const newlyPosted = displayedItems.filter((i) => isNewListing(i.createdAt)).length;
    return [
      { icon: Target, value: highlyMatched, label: "Highly matched", tone: "text-success" },
      { icon: Timer, value: closingSoon, label: "Closing soon", tone: "text-accent-pink" },
      { icon: Navigation, value: nearYou, label: "Near you", tone: "text-brand" },
      { icon: Sparkles, value: newlyPosted, label: "Newly posted", tone: "text-info" },
    ];
  }, [displayedItems, profileCity, recommendations]);

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

  const tabHref = (t: TabKey) => {
    if (!searchParams) return `?tab=${t}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", t);
    return `?${params.toString()}`;
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-28 font-sans">
      {isForYou && (
        <section className="mt-5 px-4">
          <div className="card-soft p-4">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  RootScore <Info className="size-3.5" />
                </div>
                <div className="mt-1 text-4xl font-extrabold tracking-tight">
                  {trustScore ?? "—"}
                </div>
                <div className="text-sm font-semibold text-brand">{scoreLabel(trustScore)}</div>
              </div>
              <div className="min-w-0 border-l border-border pl-4">
                <p className="text-sm leading-snug text-muted-foreground">
                  You&apos;re highly visible to casting directors and production houses.
                </p>
                <Link
                  href="/talent/profile/edit"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand/40 px-3 py-2 text-sm font-semibold text-brand"
                >
                  Improve Profile <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

          </div>
        </section>
      )}

      {isForYou && (
        <section className="mt-4 px-4">
          <div className="card-soft no-scrollbar flex gap-1 overflow-x-auto p-3">
            {stats.map((s) => {
              const content = (
                <div className="flex w-[5.5rem] shrink-0 flex-col items-center gap-1.5">
                  <div className={cn("grid size-10 place-items-center rounded-xl", s.tone)}>
                    <s.icon className="size-5" />
                  </div>
                  <span className="text-center text-[11px] leading-tight text-muted-foreground">
                    {s.label}
                  </span>
                  <span className="text-sm font-bold">{s.value}</span>
                </div>
              );
              return s.href ? (
                <Link
                  key={s.label}
                  href={s.href}
                  className="shrink-0 transition-transform active:scale-95"
                >
                  {content}
                </Link>
              ) : (
                <div key={s.label}>{content}</div>
              );
            })}
          </div>
        </section>
      )}

      {/* Top opportunities */}
      {isForYou && (
        <section className="mt-6">
          <div className="px-4">
            <SectionHeader title="Top Opportunities For You" emoji="🔥" href="?tab=All" />
          </div>
          <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-4 pb-1">
            {recsLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              items.map((item) => (
                <OpportunityCard
                  key={item.id}
                  item={item}
                  onBookmark={handleBookmark}
                  isBookmarking={bookmarkMutation.isPending}
                />
              ))
            )}
          </div>
        </section>
      )}

      {isForYou && (
        <section className="mt-6 px-4">
          <h2 className="mb-3 text-base font-extrabold tracking-tight">Explore Opportunities</h2>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="card-soft flex flex-col items-center gap-2 px-2 py-3 transition-transform active:scale-95"
              >
                <span className={cn("grid size-10 place-items-center rounded-xl", c.tone)}>
                  <c.icon className="size-5" />
                </span>
                <span className="text-center text-[11px] font-medium leading-tight">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Filtered search/list layout */}
      {!isForYou && (
        <section className="mt-2 px-4">
          {/* Sticky tabs + search */}
          <div className="sticky top-16 z-40 -mx-4 border-b border-border bg-background/95 px-4 pb-3 pt-3 backdrop-blur-xl">
            {/* Tabs */}
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {TABS.map((t) => (
                <Link
                  key={t}
                  href={tabHref(t)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    t === tab
                      ? "gradient-brand text-brand-foreground"
                      : "card-soft text-foreground hover:bg-muted",
                  )}
                >
                  {t}
                </Link>
              ))}
            </div>

            {/* Search + filter */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search roles, productions, companies..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                aria-label="Open filters"
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted"
              >
                <SlidersHorizontal className="size-5" />
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="card-soft mt-4 grid grid-cols-4 gap-2 rounded-2xl p-3">
            {quickStats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <s.icon className={cn("size-5", s.tone)} />
                <span className="text-sm font-bold">{s.value}</span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Result bar */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <h3 className="truncate text-base font-extrabold tracking-tight">
              {bookmarked
                ? `${displayedItems.length} saved`
                : `${campaignCount?.count ?? items.length} opportunities`}
            </h3>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-xs font-semibold outline-none"
              >
                <option value="relevance">Best Match</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            </div>
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
          <div className="mt-4 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <FeedCardSkeleton key={i} />)
            ) : isError ? (
              <ErrorState />
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
              <EmptyState
                onClear={() => {
                  setSearchInput("");
                  const params = new URLSearchParams();
                  params.set("tab", "All");
                  router.push(`${pathname}?${params.toString()}`);
                }}
              />
            )}
          </div>
        </section>
      )}

      <OpportunityFiltersSheet
        key={searchParams?.toString() ?? "filters"}
        open={filtersOpen}
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
      {isForYou && (
        <section className="mt-6 px-4">
          <div className="relative overflow-hidden rounded-2xl gradient-brand p-4 text-brand-foreground">
            <button className="absolute right-3 top-3 text-brand-foreground/80">
              <X className="size-4" />
            </button>
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
    </div>
  );
}
