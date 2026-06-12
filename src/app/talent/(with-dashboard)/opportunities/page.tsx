"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useInView } from "react-intersection-observer";
import {
  MapPin,
  Search,
  X,
  ArrowRight,
  Bookmark,
  ChevronDown,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Campaign } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import {
  useCampaigns,
  useBookmarkCampaign,
  useUnbookmarkCampaign,
  useBookmarkedCampaigns,
} from "@/lib/api/hooks/useCampaigns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TABS = [
  { key: "available" as const, label: "All" },
  { key: "saved" as const, label: "Saved" },
  { key: "applied" as const, label: "Applied" },
];

const INDUSTRY_OPTIONS = [
  { value: "all", label: "Industries" },
  { value: "Film", label: "Film" },
  { value: "Fashion", label: "Fashion" },
  { value: "TV", label: "TV" },
  { value: "Theater", label: "Theater" },
  { value: "Commercial", label: "Commercial" },
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

function badgeColor(industry?: string, roleType?: string): string {
  const key = (industry || roleType || "").toLowerCase();
  if (key.includes("digital") || key.includes("influencer"))
    return "bg-emerald-600";
  if (key.includes("film")) return "bg-indigo-600";
  if (key.includes("fashion")) return "bg-rose-500";
  if (key.includes("tv")) return "bg-violet-600";
  if (key.includes("theater")) return "bg-pink-600";
  return "bg-amber-600";
}

function gradientForCampaign(c: Campaign): string {
  const key = (c.industry || c.role_type || "").toLowerCase();
  if (key.includes("digital") || key.includes("influencer"))
    return "linear-gradient(135deg, var(--color-opportunity-green-start) 0%, var(--color-opportunity-green-end) 100%)";
  if (key.includes("film"))
    return "linear-gradient(135deg, var(--color-opportunity-film-start) 0%, var(--color-opportunity-film-end) 100%)";
  if (key.includes("fashion"))
    return "linear-gradient(135deg, var(--color-opportunity-fashion-start) 0%, var(--color-opportunity-fashion-end) 100%)";
  if (key.includes("tv"))
    return "linear-gradient(135deg, var(--color-opportunity-tv-start) 0%, var(--color-opportunity-tv-end) 100%)";
  if (key.includes("theater"))
    return "linear-gradient(135deg, var(--color-opportunity-theater-start) 0%, var(--color-opportunity-theater-end) 100%)";
  return "linear-gradient(135deg, var(--color-opportunity-default-start) 0%, var(--color-opportunity-default-end) 100%)";
}

export default function TalentOpportunitiesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"available" | "applied" | "saved">(
    tabParam === "applied" || tabParam === "saved" ? tabParam : "available"
  );

  const industry = searchParams.get("industry") || "all";
  const role_type = searchParams.get("role_type") || "all";
  const gender = searchParams.get("gender") || "all";
  const locationCity = searchParams.get("location_city") || "";
  const skills = searchParams.get("skills") || "";
  const languages = searchParams.get("languages") || "";

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
    [searchParams, pathname, router]
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
    setSearch("");
  }, [pathname, router]);

  const hasActiveFilters =
    industry !== "all" ||
    role_type !== "all" ||
    gender !== "all" ||
    !!locationCity ||
    !!skills ||
    !!languages ||
    !!search;

  const filters = useMemo(
    () => ({
      industry: industry === "all" ? undefined : industry,
      role_type: role_type === "all" ? undefined : role_type,
      gender: gender === "all" ? undefined : gender,
      location_city: locationCity || undefined,
      skills: skills || undefined,
      languages: languages || undefined,
      applied:
        activeTab === "applied"
          ? "true"
          : activeTab === "available"
            ? "false"
            : undefined,
    }),
    [industry, role_type, gender, locationCity, skills, languages, activeTab]
  );

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  const campaignsQuery = useCampaigns(filters);
  const bookmarksQuery = useBookmarkedCampaigns();

  const isSavedTab = activeTab === "saved";
  const isLoading = isSavedTab
    ? bookmarksQuery.isLoading
    : campaignsQuery.isLoading;
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
        (c.industry?.toLowerCase().includes(q) ?? false)
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
    [searchParams, pathname, router]
  );

  if (isLoading) {
    return (
      <div className="px-4 pt-5 pb-24 space-y-4">
        <Skeleton className="h-7 w-36" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-5">
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(error, "Failed to load opportunities")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-24 space-y-3">
      {/* Page title */}
      <h1 className="text-xl font-semibold text-text-primary">
        Opportunities
      </h1>

      {/* Tab pills */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-medium border transition-colors",
              activeTab === tab.key
                ? "bg-brand border-brand text-white"
                : "bg-card border-border text-text-secondary hover:bg-muted-bg"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted-bg">
        <Search className="w-4 h-4 text-text-tertiary shrink-0" strokeWidth={1.5} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          placeholder="Search opportunities..."
          aria-label="Search opportunities"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")}>
            <X className="w-3.5 h-3.5 text-text-muted hover:text-text-secondary" />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:overflow-visible"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Select value={industry} onValueChange={(v) => updateParam("industry", v)}>
          <SelectTrigger className="h-7 rounded-full text-xs bg-card border-border px-3 gap-1 shrink-0">
            <SelectValue placeholder="Industries" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={role_type} onValueChange={(v) => updateParam("role_type", v)}>
          <SelectTrigger className="h-7 rounded-full text-xs bg-card border-border px-3 gap-1 shrink-0">
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

        <Select value={gender} onValueChange={(v) => updateParam("gender", v)}>
          <SelectTrigger className="h-7 rounded-full text-xs bg-card border-border px-3 gap-1 shrink-0">
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

        <div className="relative shrink-0">
          <div className="flex items-center h-7 rounded-full text-xs bg-card border border-border px-3 gap-1">
            <MapPin className="w-3 h-3 text-text-muted" strokeWidth={1.5} />
            <input
              value={locationCity}
              onChange={(e) => updateParam("location_city", e.target.value)}
              placeholder="City..."
              className="w-20 bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none"
            />
            {locationCity && (
              <button onClick={() => updateParam("location_city", "")}>
                <X className="w-3 h-3 text-text-muted hover:text-text-secondary" />
              </button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="h-7 px-2.5 rounded-full text-xs font-medium text-brand hover:text-brand-hover hover:bg-brand-light transition-colors flex items-center gap-1 shrink-0 border border-transparent"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      <div className="pt-1 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Clock
              className="w-10 h-10 text-text-muted mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-sm text-text-muted mb-1">No opportunities yet</p>
            <p className="text-xs text-text-muted">
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
                onClick={clearFilters}
                className="mt-3 inline-flex items-center text-xs font-medium text-brand hover:text-brand-hover transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {filtered.map((campaign) => (
              <OpportunityCard
                key={campaign._id}
                campaign={campaign}
                activeTab={activeTab}
                onView={() =>
                  router.push(`/talent/opportunities/${campaign._id}`)
                }
              />
            ))}

            {!isSavedTab && campaignsQuery.hasNextPage && (
              <div ref={sentinelRef} className="py-3">
                {campaignsQuery.isFetchingNextPage ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-72 rounded-2xl" />
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OpportunityCard({
  campaign,
  activeTab,
  onView,
}: {
  campaign: Campaign;
  activeTab: string;
  onView: () => void;
}) {
  const loc = [campaign.location?.city, campaign.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  const deadline = formatDeadline(campaign.deadline);
  const bookmark = useBookmarkCampaign();
  const unbookmark = useUnbookmarkCampaign();
  const isBookmarked = campaign.is_bookmarked;
  const isPending = bookmark.isPending || unbookmark.isPending;

  const imageUrl =
    campaign.cover_image_url ||
    campaign.banner?.url ||
    campaign.media?.find((m) => m.type === "image")?.url;

  const badgeLabel = campaign.role_type || campaign.industry || "Campaign";
  const badgeBg = badgeColor(campaign.industry, campaign.role_type);

  const amberTags: string[] = [];
  const slateTags: string[] = [];

  if (campaign.role_type) amberTags.push(campaign.role_type);
  if (campaign.requirements?.skills) {
    campaign.requirements.skills.slice(0, 2).forEach((s) => amberTags.push(s));
  }
  if (campaign.requirements?.gender) slateTags.push(campaign.requirements.gender);
  if (campaign.requirements?.age_range) {
    const { min, max } = campaign.requirements.age_range;
    if (min != null && max != null) slateTags.push(`${min}-${max}`);
    else if (min != null) slateTags.push(`${min}+`);
    else if (max != null) slateTags.push(`<${max}`);
  }
  if (deadline && !deadline.urgent) slateTags.push(deadline.label);

  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Thumbnail */}
      <div className="relative w-full h-[140px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: gradientForCampaign(campaign) }}
          >
            <span className="text-[11px] text-white/40 tracking-wider uppercase">
              Campaign preview
            </span>
          </div>
        )}
        <div
          className={cn(
            "absolute top-2.5 right-2.5 text-white text-[10px] font-medium px-2 py-[3px] rounded-full",
            badgeBg
          )}
        >
          {badgeLabel}
        </div>

        {/* Bookmark */}
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
          disabled={isPending}
          className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors backdrop-blur-sm"
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <Bookmark
            className={cn(
              "w-3.5 h-3.5",
              isBookmarked ? "fill-white text-white" : "text-white/80"
            )}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* Body */}
      <div className="px-3.5 pt-3 pb-3.5">
        {/* Meta */}
        <p className="text-[11px] font-medium text-brand mb-1 tracking-wide">
          {campaign.industry}
          {campaign.industry && campaign.role_type ? " · " : ""}
          {campaign.role_type}
        </p>

        {/* Title */}
        <h3 className="text-[15px] font-medium text-text-primary leading-snug mb-1.5">
          {campaign.name}
        </h3>

        {/* Description */}
        {campaign.description && (
          <p className="text-xs text-text-secondary leading-relaxed mb-2.5 line-clamp-2">
            {campaign.description}
          </p>
        )}

        {/* Location row */}
        <div className="flex items-center gap-4 mb-2.5">
          {loc && (
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{loc}</span>
            </div>
          )}
          {deadline && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                deadline.urgent
                  ? "text-amber-700 font-medium"
                  : "text-text-secondary"
              )}
            >
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{deadline.label}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {amberTags.slice(0, 3).map((tag, i) => (
            <span
              key={`a-${i}`}
              className="px-2.5 py-[3px] rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
            >
              {tag}
            </span>
          ))}
          {slateTags.slice(0, 2).map((tag, i) => (
            <span
              key={`s-${i}`}
              className="px-2.5 py-[3px] rounded-full text-[11px] font-medium bg-muted-bg text-text-secondary border border-border"
            >
              {tag}
            </span>
          ))}
          {campaign.my_application && activeTab === "applied" && (
            <span
              className={cn(
                "px-2.5 py-[3px] rounded-full text-[11px] font-medium border",
                campaign.my_application.status === "accepted"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : campaign.my_application.status === "rejected"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
              )}
            >
              {campaign.my_application.status === "pending"
                ? "Pending"
                : campaign.my_application.status === "accepted"
                  ? "Accepted"
                  : "Rejected"}
            </span>
          )}
        </div>

        {/* Budget + CTA */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle">
          <div>
            <p className="text-[11px] text-text-tertiary mb-0.5">Budget</p>
            <p className="text-sm font-medium text-text-primary">
              {campaign.budget_range?.currency ?? "₹"}
              {campaign.budget_range?.min?.toLocaleString() ?? ""}
              {campaign.budget_range?.max
                ? ` – ${campaign.budget_range.max.toLocaleString()}`
                : campaign.budget_range?.min
                  ? "+"
                  : "Not disclosed"}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-brand text-white text-[13px] font-medium hover:bg-brand-hover active:scale-[0.98] transition-all"
          >
            View details
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  );
}
