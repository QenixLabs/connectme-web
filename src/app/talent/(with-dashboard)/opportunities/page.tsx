"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useInView } from "react-intersection-observer";
import {
  MapPin,
  Search,
  X,
  Bookmark,
  Clock,
  Users,
  Compass,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/formatters";
import { PROFESSIONS } from "@/lib/professions";
import {
  useCampaigns,
  useBookmarkCampaign,
  useUnbookmarkCampaign,
  useBookmarkedCampaigns,
} from "@/lib/api/hooks/useCampaigns";
import { type Campaign } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                         */
/* ------------------------------------------------------------------ */

const TABS = [
  { key: "available" as const, label: "All" },
  { key: "saved" as const, label: "Saved" },
  { key: "applied" as const, label: "Applied" },
];

const ROLE_TYPE_OPTIONS = [
  { value: "all", label: "Role type" },
  ...PROFESSIONS.map((p) => ({ value: p, label: p })),
];

const GENDER_OPTIONS = [
  { value: "all", label: "Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

const PROFESSION_GRADIENT: Record<string, string> = {
  Actor: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  Model: "from-[var(--color-opportunity-fashion-start)] to-[var(--color-opportunity-fashion-end)]",
  Singer: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  Musician: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  Dancer: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  "Voice Artist": "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  Anchor: "from-[var(--color-opportunity-tv-start)] to-[var(--color-opportunity-tv-end)]",
  Influencer: "from-[var(--color-opportunity-tv-start)] to-[var(--color-opportunity-tv-end)]",
  Director: "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  Writer: "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  Photographer: "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  Cinematographer: "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  Editor: "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  Choreographer: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  "Makeup Artist": "from-[var(--color-opportunity-fashion-start)] to-[var(--color-opportunity-fashion-end)]",
  Stylist: "from-[var(--color-opportunity-fashion-start)] to-[var(--color-opportunity-fashion-end)]",
  Producer: "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  Comedian: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  "Child Artist": "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  "Other Creative Roles": "from-[var(--color-opportunity-default-start)] to-[var(--color-opportunity-default-end)]",
};

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */

function resolveGradient(roleType?: string) {
  if (!roleType) return "from-[var(--color-opportunity-default-start)] to-[var(--color-opportunity-default-end)]";
  const key = roleType.toLowerCase();
  for (const [k, v] of Object.entries(PROFESSION_GRADIENT)) {
    if (key.includes(k.toLowerCase())) return v;
  }
  return "from-[var(--color-opportunity-default-start)] to-[var(--color-opportunity-default-end)]";
}

function formatDeadline(deadline?: string) {
  if (!deadline) return null;
  const date = new Date(deadline);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: "Expired", urgent: false };
  if (daysLeft === 0) return { label: "Due today", urgent: true };
  if (daysLeft <= 3) return { label: `${daysLeft}d left`, urgent: true };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, urgent: false };
  return {
    label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    urgent: false,
  };
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                              */
/* ------------------------------------------------------------------ */

export default function TalentOpportunitiesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"available" | "applied" | "saved">(
    tabParam === "applied" || tabParam === "saved" ? tabParam : "available",
  );

  const role_type = searchParams.get("role_type") || "all";
  const gender = searchParams.get("gender") || "all";
  const locationCity = searchParams.get("location_city") || "";
  const sort = searchParams.get("sort") || "relevance";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
    setSearch("");
  }, [pathname, router]);

  const hasActiveFilters =
    role_type !== "all" ||
    gender !== "all" ||
    !!locationCity ||
    !!search;

  const filters = useMemo(
    () => ({
      role_type: role_type === "all" ? undefined : role_type,
      gender: gender === "all" ? undefined : gender,
      location_city: locationCity || undefined,
      sort,
      applied:
        activeTab === "applied"
          ? "true"
          : activeTab === "available"
            ? "false"
            : undefined,
    }),
    [role_type, gender, locationCity, sort, activeTab],
  );

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  const campaignsQuery = useCampaigns(filters);
  const bookmarksQuery = useBookmarkedCampaigns();

  const isSavedTab = activeTab === "saved";
  const isLoading = isSavedTab ? bookmarksQuery.isLoading : campaignsQuery.isLoading;
  const error = isSavedTab ? bookmarksQuery.error : campaignsQuery.error;

  useEffect(() => {
    if (
      !isSavedTab &&
      inView &&
      campaignsQuery.hasNextPage &&
      !campaignsQuery.isFetchingNextPage
    ) {
      campaignsQuery.fetchNextPage();
    }
  }, [
    inView,
    campaignsQuery.hasNextPage,
    campaignsQuery.isFetchingNextPage,
    campaignsQuery.fetchNextPage,
    isSavedTab,
  ]);

  const allCampaigns: Campaign[] = useMemo(() => {
    if (isSavedTab) {
      return bookmarksQuery.data || [];
    }
    return campaignsQuery.data
      ? campaignsQuery.data.pages.flatMap((p) => p.data)
      : [];
  }, [campaignsQuery.data, bookmarksQuery.data, isSavedTab]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allCampaigns;
    const q = search.toLowerCase();
    return allCampaigns.filter(
      (c) =>
        (c.name?.toLowerCase().includes(q) ?? false) ||
        (c.description?.toLowerCase().includes(q) ?? false) ||
        (c.role_type?.toLowerCase().includes(q) ?? false),
    );
  }, [allCampaigns, search]);

  const handleTabChange = useCallback(
    (next: "available" | "applied" | "saved") => {
      setActiveTab(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "available") {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  return (
    <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-serif font-semibold text-ink tracking-tight">
          Opportunities
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Discover roles that match your talent
        </p>
      </div>

      {/* Segmented Tab Bar */}
      <Card className="p-1 mb-5 shadow-luxe">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "flex-1 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                activeTab === tab.key
                  ? "bg-gold text-white shadow-sm"
                  : "text-ink-soft hover:text-ink hover:bg-cream",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Search */}
      <div className="mb-3">
        <div className="flex items-center gap-2.5 px-3.5 h-11 rounded-xl bg-cream border border-border-warm transition-colors focus-within:border-gold/40 focus-within:bg-white">
          <Search className="h-4 w-4 text-ink-muted shrink-0" strokeWidth={1.5} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder="Search by name, role, or keyword..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted/60 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="shrink-0 p-0.5 rounded-full hover:bg-border-light transition-colors"
            >
              <X className="h-3.5 w-3.5 text-ink-muted hover:text-ink-soft" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Row + Results Count */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0 text-ink-muted mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>

          <FilterPill
            value={role_type}
            label="Role type"
            options={ROLE_TYPE_OPTIONS}
            onChange={(v) => updateParam("role_type", v)}
          />
          <FilterPill
            value={gender}
            label="Gender"
            options={GENDER_OPTIONS}
            onChange={(v) => updateParam("gender", v)}
          />

          <div
            className={cn(
              "flex items-center h-8 rounded-full text-xs px-3 gap-1.5 shrink-0 border transition-colors",
              locationCity
                ? "bg-gold-soft border-gold/30 text-gold-ink"
                : "bg-card border-border-warm text-ink-soft",
            )}
          >
            <MapPin className="h-3 w-3 text-current" strokeWidth={1.5} />
            <input
              value={locationCity}
              onChange={(e) => updateParam("location_city", e.target.value)}
              placeholder="City..."
              className="w-16 bg-transparent text-xs text-current placeholder:text-current/50 outline-none"
            />
            {locationCity && (
              <button onClick={() => updateParam("location_city", "")}>
                <X className="h-3 w-3 text-current" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-8 px-2.5 rounded-full text-xs font-medium text-gold hover:bg-gold-soft transition-colors flex items-center gap-1 shrink-0"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        <div className="shrink-0">
          <Select value={sort} onValueChange={(v) => updateParam("sort", v)}>
            <SelectTrigger className="h-8 rounded-full text-xs px-3 gap-1 border-border-warm bg-card text-ink-soft">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <ResultsList
        campaigns={filtered}
        activeTab={activeTab}
        isLoading={isLoading}
        error={error}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        isSavedTab={isSavedTab}
        hasNextPage={!isSavedTab && campaignsQuery.hasNextPage}
        isFetchingNextPage={!isSavedTab && campaignsQuery.isFetchingNextPage}
        sentinelRef={sentinelRef}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FILTER PILL (reusable select trigger)                             */
/* ------------------------------------------------------------------ */

function FilterPill({
  value,
  label,
  options,
  onChange,
}: {
  value: string;
  label: string;
  options?: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const isActive = value !== "all";
  const items = options || [{ value: "all", label }];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-8 rounded-full text-xs px-3 gap-1 shrink-0 border transition-colors",
          isActive
            ? "bg-gold-soft border-gold/30 text-gold-ink"
            : "bg-card border-border-warm text-ink-soft",
        )}
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {items.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ------------------------------------------------------------------ */
/*  RESULTS LIST                                                      */
/* ------------------------------------------------------------------ */

function ResultsList({
  campaigns,
  activeTab,
  isLoading,
  error,
  hasActiveFilters,
  onClearFilters,
  isSavedTab,
  hasNextPage,
  isFetchingNextPage,
  sentinelRef,
}: {
  campaigns: Campaign[];
  activeTab: string;
  isLoading: boolean;
  error: unknown;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  isSavedTab: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  sentinelRef: (node?: Element | null) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-5 border-error-muted bg-error-light text-sm text-error-text rounded-2xl">
        {getApiErrorMessage(error, "Failed to load opportunities")}
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="p-10 flex flex-col items-center text-center rounded-2xl">
        <div className="h-14 w-14 rounded-2xl bg-cream-deep grid place-items-center mb-4">
          <Compass className="h-7 w-7 text-ink-muted" />
        </div>
        <p className="text-sm font-semibold text-ink">No opportunities found</p>
        <p className="text-xs text-ink-muted mt-1.5 max-w-[280px] leading-relaxed">
          {hasActiveFilters
            ? "Try adjusting your filters to see more results."
            : activeTab === "applied"
              ? "You haven\u2019t applied to any campaigns yet."
              : activeTab === "saved"
                ? "No saved campaigns yet. Bookmark campaigns to find them here."
                : "Complete your profile to get matched with casting calls."}
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="mt-4 text-xs font-semibold text-gold hover:text-gold-ink transition-colors"
          >
            Clear all filters
          </button>
        )}
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {campaigns.map((campaign, i) => (
        <motion.div
          key={campaign._id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
        >
          <OpportunityCard campaign={campaign} activeTab={activeTab} />
        </motion.div>
      ))}

      {!isSavedTab && hasNextPage && (
        <div ref={sentinelRef} className="col-span-full py-2">
          {isFetchingNextPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-2xl" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  OPPORTUNITY CARD                                                  */
/* ------------------------------------------------------------------ */

function OpportunityCard({
  campaign,
  activeTab,
}: {
  campaign: Campaign;
  activeTab: string;
}) {
  const router = useRouter();
  const gradient = resolveGradient(campaign.role_type);
  const loc = [campaign.location?.city, campaign.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");
  const deadline = formatDeadline(campaign.deadline);
  const bookmark = useBookmarkCampaign();
  const unbookmark = useUnbookmarkCampaign();
  const isBookmarked = campaign.is_bookmarked;
  const isPending = bookmark.isPending || unbookmark.isPending;

  return (
    <div
      onClick={() => router.push(`/talent/opportunities/${campaign._id}`)}
      className="cursor-pointer group"
    >
      <Card
        className={cn(
          "overflow-hidden rounded-2xl border-0 text-white",
          "bg-gradient-to-br",
          gradient,
          "shadow-luxe group-hover:shadow-luxe-lg transition-shadow duration-300",
        )}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {campaign.role_type && (
                  <span className="text-[11px] bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 font-medium tracking-wide">
                    {campaign.role_type}
                  </span>
                )}
                {campaign.match_score != null && campaign.match_score > 0 && (
                  <span className="text-[11px] bg-gold/80 backdrop-blur-sm rounded-full px-2.5 py-1 font-semibold text-surface-dark">
                    {campaign.match_score}% match
                  </span>
                )}
              </div>

              <h3 className="text-[15px] font-bold leading-snug line-clamp-2 tracking-tight">
                {campaign.name}
              </h3>

              {campaign.description && (
                <p className="text-[12px] text-white/55 mt-1.5 line-clamp-1 leading-relaxed">
                  {campaign.description}
                </p>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isPending) return;
                if (isBookmarked) {
                  unbookmark.mutate(campaign._id);
                } else {
                  bookmark.mutate(campaign._id);
                }
              }}
              className="shrink-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <Bookmark
                className={cn("h-4 w-4", isBookmarked ? "fill-white text-white" : "text-white/70")}
                strokeWidth={isBookmarked ? 2 : 1.5}
              />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/10">
            <div className="flex items-center gap-3.5">
              {loc && (
                <span className="text-[11px] text-white/65 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {loc}
                </span>
              )}
              {deadline && (
                <span
                  className={cn(
                    "text-[11px] flex items-center gap-1",
                    deadline.urgent ? "text-amber-300 font-medium" : "text-white/65",
                  )}
                >
                  <Clock className="h-3 w-3" />
                  {deadline.label}
                </span>
              )}
            </div>
            <span className="text-[11px] text-white/65 flex items-center gap-1">
              <Users className="h-3 w-3" />
              {campaign.applications_count ?? 0}
            </span>
          </div>

          {activeTab === "applied" && campaign.my_application && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <span
                className={cn(
                  "text-[11px] font-medium rounded-full px-2.5 py-1",
                  campaign.my_application.status === "accepted"
                    ? "bg-emerald-500/20 text-emerald-200"
                    : campaign.my_application.status === "rejected"
                      ? "bg-red-500/20 text-red-200"
                      : "bg-amber-500/20 text-amber-200",
                )}
              >
                {campaign.my_application.status === "pending"
                  ? "Pending"
                  : campaign.my_application.status === "accepted"
                    ? "Accepted"
                    : "Rejected"}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
