"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useInView } from "react-intersection-observer";
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Campaign } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { useCampaigns } from "@/lib/api/hooks/useCampaigns";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
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

const INDUSTRY_OPTIONS = [
  { value: "all", label: "Industries" },
  { value: "Film", label: "Film" },
  { value: "Fashion", label: "Fashion" },
  { value: "TV", label: "TV" },
  { value: "Theater", label: "Theater" },
  { value: "Commercial", label: "Commercial" },
];

const ROLE_TYPE_OPTIONS = [
  { value: "all", label: "Role Types" },
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

export default function TalentOpportunitiesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");

  const industry = searchParams.get("industry") || "all";
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
    industry !== "all" ||
    role_type !== "all" ||
    gender !== "all" ||
    !!locationCity ||
    !!search;

  const filters = useMemo(
    () => ({
      industry: industry === "all" ? undefined : industry,
      role_type: role_type === "all" ? undefined : role_type,
      gender: gender === "all" ? undefined : gender,
      location_city: locationCity || undefined,
    }),
    [industry, role_type, gender, locationCity],
  );

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useCampaigns(filters);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allCampaigns = useMemo(
    () => (data ? data.pages.flatMap((p) => p.data) : []),
    [data],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return allCampaigns;
    const q = search.toLowerCase();
    return allCampaigns.filter(
      (c) =>
        (c.name?.toLowerCase().includes(q) ?? false) ||
        (c.description?.toLowerCase().includes(q) ?? false) ||
        (c.industry?.toLowerCase().includes(q) ?? false),
    );
  }, [allCampaigns, search]);

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 pb-24 lg:pb-8 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(error, "Failed to load opportunities")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 pb-24 lg:pb-8 flex flex-col gap-4 sm:gap-5">
      <SectionHeader
        title="Opportunities"
      />

      {/* Search */}
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1 sm:flex-none sm:w-[280px] lg:w-[320px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10"
            strokeWidth={1.5}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder="Search opportunities..."
            aria-label="Search opportunities"
            className="h-10 rounded-[10px] bg-card border-[1.5px] border-border pl-9 text-sm"
          />
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:overflow-visible"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted mr-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
    
        </div>

        <Select
          value={industry}
          onValueChange={(v) => updateParam("industry", v)}
        >
          <SelectTrigger className="h-9 w-[150px] sm:w-[160px] rounded-lg text-xs bg-card border-border shrink-0">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={role_type}
          onValueChange={(v) => updateParam("role_type", v)}
        >
          <SelectTrigger className="h-9 w-[150px] sm:w-[160px] rounded-lg text-xs bg-card border-border shrink-0">
            <SelectValue placeholder="Role Type" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={gender}
          onValueChange={(v) => updateParam("gender", v)}
        >
          <SelectTrigger className="h-9 w-[120px] sm:w-[130px] rounded-lg text-xs bg-card border-border shrink-0">
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

        <div className="relative w-[150px] sm:w-[180px] shrink-0">
          <MapPin
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none z-10"
            strokeWidth={1.5}
          />
          <Input
            value={locationCity}
            onChange={(e) => updateParam("location_city", e.target.value)}
            placeholder="City..."
            className="h-9 rounded-lg text-xs pl-8 bg-card border-border"
          />
          {locationCity && (
            <button
              onClick={() => updateParam("location_city", "")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="h-9 px-2.5 rounded-lg text-xs font-medium text-brand hover:text-brand-hover hover:bg-brand-light transition-colors flex items-center gap-1 shrink-0"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 min-w-0">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <Clock
              className="w-10 h-10 text-text-muted mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-sm text-text-muted mb-1">No opportunities yet</p>
            <p className="text-xs text-text-muted">
              {hasActiveFilters
                ? "Try adjusting your filters."
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((campaign) => (
                <OpportunityCard
                  key={campaign._id}
                  campaign={campaign}
                  onView={() =>
                    router.push(`/talent/opportunities/${campaign._id}`)
                  }
                />
              ))}
            </div>

            {hasNextPage && (
              <div ref={sentinelRef} className="py-4">
                {isFetchingNextPage ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-64 rounded-2xl" />
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
  onView,
}: {
  campaign: Campaign;
  onView: () => void;
}) {
  const deadline = formatDeadline(campaign.deadline);
  const loc = [campaign.location?.city, campaign.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  return (
    <article
      className="bg-card border border-border rounded-2xl p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(79,110,247,0.12),0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col gap-3 cursor-pointer"
      onClick={onView}
    >
      <div>
        <h3 className="text-base font-bold text-text-primary leading-tight line-clamp-2">
          {campaign.name}
        </h3>
        {campaign.industry && (
          <p className="text-xs text-text-muted mt-0.5">{campaign.industry}</p>
        )}
      </div>

      {campaign.description && (
        <p className="text-[13px] text-text-secondary line-clamp-3 leading-[1.45]">
          {campaign.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-text-muted">
        {loc && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" strokeWidth={1.5} />
            <span>{loc}</span>
          </div>
        )}
        {deadline && (
          <div
            className={cn(
              "flex items-center gap-1",
              deadline.urgent ? "text-error-text font-semibold" : "",
            )}
          >
            <Calendar className="w-3 h-3" strokeWidth={1.5} />
            <span>{deadline.label}</span>
          </div>
        )}
      </div>

      {(campaign.role_type || campaign.requirements?.gender) && (
        <div className="flex flex-wrap gap-1.5">
          {campaign.role_type && (
            <span className="px-2.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-xs font-medium">
              {campaign.role_type}
            </span>
          )}
          {campaign.requirements?.gender && (
            <span className="px-2.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-xs font-medium">
              {campaign.requirements.gender}
            </span>
          )}
        </div>
      )}

      {campaign.budget_range && (
        <div className="pt-2 border-t border-border-subtle">
          <p className="text-xs text-text-muted">
            Budget:{" "}
            <span className="font-medium text-text-secondary">
              {campaign.budget_range.currency ?? "USD"}{" "}
              {campaign.budget_range.min?.toLocaleString()}
              {campaign.budget_range.max
                ? ` - ${campaign.budget_range.max.toLocaleString()}`
                : "+"}
            </span>
          </p>
        </div>
      )}

      <div className="mt-auto pt-2 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 h-10 text-[13px]"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 ml-1" strokeWidth={1.5} />
        </Button>
      </div>
    </article>
  );
}
