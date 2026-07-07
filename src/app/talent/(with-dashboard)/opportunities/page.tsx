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

const PROFESSION_OPTIONS = [
  { value: "all", label: "Profession" },
  ...PROFESSIONS.map((p) => ({ value: p, label: p })),
];

const ROLE_TYPE_OPTIONS = [
  { value: "all", label: "Role type" },
  { value: "Actor", label: "Actor" },
  { value: "Model", label: "Model" },
  { value: "Influencer", label: "Influencer" },
  { value: "Dancer", label: "Dancer" },
  { value: "Voice Over", label: "Voice Over" },
];

const GENDER_OPTIONS = [
  { value: "all", label: "Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const PROFESSION_GRADIENT: Record<string, string> = {
  Actor: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  Model: "from-[var(--color-opportunity-fashion-start)] to-[var(--color-opportunity-fashion-end)]",
  Dancer: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  Musician: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  "Voice Artist": "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  Photographer: "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  Influencer: "from-[var(--color-opportunity-tv-start)] to-[var(--color-opportunity-tv-end)]",
  "Extra / Background": "from-[var(--color-opportunity-default-start)] to-[var(--color-opportunity-default-end)]",
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

  const profession = searchParams.get("profession") || "all";
  const role_type = searchParams.get("role_type") || "all";
  const gender = searchParams.get("gender") || "all";
  const locationCity = searchParams.get("location_city") || "";

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
    profession !== "all" ||
    role_type !== "all" ||
    gender !== "all" ||
    !!locationCity ||
    !!search;

  const filters = useMemo(
    () => ({
      profession: profession === "all" ? undefined : profession,
      role_type: role_type === "all" ? undefined : role_type,
      gender: gender === "all" ? undefined : gender,
      location_city: locationCity || undefined,
      applied:
        activeTab === "applied"
          ? "true"
          : activeTab === "available"
            ? "false"
            : undefined,
    }),
    [profession, role_type, gender, locationCity, activeTab],
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
    <div className="px-4 pt-5 pb-24 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-serif font-semibold text-ink">Opportunities</h1>

      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <SearchBar
        search={search}
        onSearchChange={setSearch}
        profession={profession}
        roleType={role_type}
        gender={gender}
        locationCity={locationCity}
        onParamChange={updateParam}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

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
/*  TAB BAR                                                           */
/* ------------------------------------------------------------------ */

function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: "available" | "saved" | "applied";
  onTabChange: (tab: "available" | "saved" | "applied") => void;
}) {
  return (
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "px-4 py-1.5 rounded-full text-[13px] font-medium border transition-colors",
            activeTab === tab.key
              ? "bg-gold border-gold text-white"
              : "bg-card border-border text-ink-soft hover:bg-cream",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SEARCH BAR                                                        */
/* ------------------------------------------------------------------ */

function SearchBar({
  search,
  onSearchChange,
  profession,
  roleType,
  gender,
  locationCity,
  onParamChange,
  hasActiveFilters,
  onClearFilters,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  profession: string;
  roleType: string;
  gender: string;
  locationCity: string;
  onParamChange: (key: string, value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-3 h-10 rounded-xl bg-cream border border-border">
        <Search className="h-4 w-4 text-ink-muted shrink-0" strokeWidth={1.5} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          type="search"
          placeholder="Search opportunities..."
          className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-muted/60 outline-none"
        />
        {search && (
          <button onClick={() => onSearchChange("")} className="shrink-0">
            <X className="h-3.5 w-3.5 text-ink-muted hover:text-ink-soft" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-wrap">
        <Select value={profession} onValueChange={(v) => onParamChange("profession", v)}>
          <SelectTrigger
            className={cn(
              "h-7 rounded-full text-[11px] px-3 gap-1 shrink-0 border transition-colors",
              profession !== "all"
                ? "bg-gold-soft border-gold/30 text-gold-ink"
                : "bg-card border-border text-ink-soft",
            )}
          >
            <SelectValue placeholder="Profession" />
          </SelectTrigger>
          <SelectContent>
            {PROFESSION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={roleType} onValueChange={(v) => onParamChange("role_type", v)}>
          <SelectTrigger
            className={cn(
              "h-7 rounded-full text-[11px] px-3 gap-1 shrink-0 border transition-colors",
              roleType !== "all"
                ? "bg-gold-soft border-gold/30 text-gold-ink"
                : "bg-card border-border text-ink-soft",
            )}
          >
            <SelectValue placeholder="Role type" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={gender} onValueChange={(v) => onParamChange("gender", v)}>
          <SelectTrigger
            className={cn(
              "h-7 rounded-full text-[11px] px-3 gap-1 shrink-0 border transition-colors",
              gender !== "all"
                ? "bg-gold-soft border-gold/30 text-gold-ink"
                : "bg-card border-border text-ink-soft",
            )}
          >
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            {GENDER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          className={cn(
            "flex items-center h-7 rounded-full text-[11px] px-3 gap-1.5 shrink-0 border transition-colors",
            locationCity
              ? "bg-gold-soft border-gold/30 text-gold-ink"
              : "bg-card border-border text-ink-soft",
          )}
        >
          <MapPin className="h-3 w-3 text-current" strokeWidth={1.5} />
          <input
            value={locationCity}
            onChange={(e) => onParamChange("location_city", e.target.value)}
            placeholder="City..."
            className="w-16 bg-transparent text-[11px] text-current placeholder:text-current/50 outline-none"
          />
          {locationCity && (
            <button onClick={() => onParamChange("location_city", "")}>
              <X className="h-3 w-3 text-current" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="h-7 px-2.5 rounded-full text-[11px] font-medium text-gold hover:bg-gold-soft transition-colors flex items-center gap-1 shrink-0"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
    </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-error-muted bg-error-light text-sm text-error-text">
        {getApiErrorMessage(error, "Failed to load opportunities")}
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="p-8 flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-2xl bg-cream grid place-items-center mb-3">
          <Compass className="h-6 w-6 text-ink-muted" />
        </div>
        <p className="text-[14px] font-medium text-ink">No opportunities found</p>
        <p className="text-[12px] text-ink-muted mt-1 max-w-[260px]">
          {hasActiveFilters
            ? "Try adjusting your filters."
            : activeTab === "applied"
              ? "You haven't applied to any campaigns yet."
              : activeTab === "saved"
                ? "No saved campaigns yet."
                : "Complete your profile to get matched with casting calls."}
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="mt-3 text-[12px] font-medium text-gold hover:text-gold-ink transition-colors"
          >
            Clear filters
          </button>
        )}
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
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
        <div ref={sentinelRef} className="col-span-full py-1">
          {isFetchingNextPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
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
      className="cursor-pointer"
    >
      <Card
        className={cn(
          "overflow-hidden rounded-xl border-0 text-white",
          "bg-gradient-to-br",
          gradient,
        )}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {campaign.role_type && (
                  <span className="text-[10.5px] bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 font-medium">
                    {campaign.role_type}
                  </span>
                )}
              </div>

              <h3 className="text-[14px] font-bold leading-snug line-clamp-2">{campaign.name}</h3>

              {campaign.description && (
                <p className="text-[11px] text-white/60 mt-1 line-clamp-1">
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
              className="shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <Bookmark
                className={cn("h-3.5 w-3.5", isBookmarked ? "fill-white text-white" : "text-white/70")}
                strokeWidth={isBookmarked ? 2 : 1.5}
              />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              {loc && (
                <span className="text-[10.5px] text-white/70 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {loc}
                </span>
              )}
              {deadline && (
                <span
                  className={cn(
                    "text-[10.5px] flex items-center gap-1",
                    deadline.urgent ? "text-amber-300" : "text-white/70",
                  )}
                >
                  <Clock className="h-3 w-3" />
                  {deadline.label}
                </span>
              )}
            </div>
            <span className="text-[10.5px] text-white/70 flex items-center gap-1">
              <Users className="h-3 w-3" />
              {campaign.applications_count ?? 0}
            </span>
          </div>

          {activeTab === "applied" && campaign.my_application && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <span
                className={cn(
                  "text-[10.5px] font-medium rounded-full px-2.5 py-1",
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
