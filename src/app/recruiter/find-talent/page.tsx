"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useInView } from "react-intersection-observer";
import {
  Search,
  MapPin,
  X,
  Mail,
  CheckSquare,
  Square,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/formatters";
import { useTalentSearch } from "@/lib/api/hooks/useTalentSearch";
import { useDistinctProfessions } from "@/lib/api/hooks/useDistinctProfessions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TalentGridCard } from "@/components/talent-grid-card";
import { TalentListRow } from "@/components/talent-list-row";
import { InviteToCampaignModal } from "@/components/invite-to-campaign-modal";

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "not_available", label: "Not Available" },
];

const GENDER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function FindTalentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<{ id: string; name: string } | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const profession = searchParams.get("profession") || "all";
  const availability = searchParams.get("availability") || "all";
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
  }, [pathname, router]);

  const toggleSelectMode = useCallback(() => {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  }, []);

  const toggleTalentSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkInvite = useCallback(() => {
    if (selectedIds.size === 0) return;
    setInviteModalOpen(true);
  }, [selectedIds]);

  const hasActiveFilters =
    profession !== "all" || availability !== "all" || gender !== "all" || !!locationCity;

  const filters = useMemo(
    () => ({
      profession: profession === "all" ? undefined : profession,
      availability: availability === "all" ? undefined : availability,
      gender: gender === "all" ? undefined : gender,
      location_city: locationCity || undefined,
    }),
    [profession, availability, gender, locationCity],
  );

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useTalentSearch(filters);

  const { data: professionOptions, isLoading: professionsLoading } =
    useDistinctProfessions("");

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProfiles = useMemo(
    () => (data ? data.pages.flatMap((p) => p.data) : []),
    [data],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return allProfiles;
    const q = search.toLowerCase();
    return allProfiles.filter(
      (p) =>
        (p.username?.toLowerCase().includes(q) ?? false) ||
        (p.full_legal_name?.toLowerCase().includes(q) ?? false) ||
        (p.headline?.toLowerCase().includes(q) ?? false) ||
        (p.professions?.some((prof) =>
          prof.toLowerCase().includes(q),
        ) ?? false),
    );
  }, [allProfiles, search]);

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 pb-24 lg:pb-8">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="flex flex-wrap gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
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
            {getApiErrorMessage(error, "Failed to load talent")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 pb-24 lg:pb-8 flex flex-col gap-4 sm:gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-[22px] leading-tight font-bold text-text-primary">
            Find Talent
          </h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-[280px] lg:w-[320px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10"
              strokeWidth={1.5}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Search by name, profession..."
              aria-label="Search talent"
              className="h-10 rounded-[10px] bg-card border-[1.5px] border-border pl-9 text-sm"
            />
          </div>
          <button
            onClick={toggleSelectMode}
            className={cn(
              "h-8 px-2.5 rounded-md text-xs font-medium border shrink-0 transition-colors flex items-center gap-1.5",
              selectMode
                ? "bg-brand text-white border-brand"
                : "bg-card text-text-secondary border-border hover:border-brand hover:text-brand",
            )}
          >
            {selectMode ? <CheckSquare className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Square className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {selectMode ? "Done" : "Select"}
          </button>
          <div className="flex items-center border border-border rounded-md overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-8 w-8 flex items-center justify-center transition-colors",
                viewMode === "grid"
                  ? "bg-text-primary text-white"
                  : "bg-card text-text-secondary hover:bg-muted-bg",
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "h-8 w-8 flex items-center justify-center transition-colors",
                viewMode === "list"
                  ? "bg-text-primary text-white"
                  : "bg-card text-text-secondary hover:bg-muted-bg",
              )}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Select
          value={availability}
          onValueChange={(v) => updateParam("availability", v)}
        >
          <SelectTrigger className="h-8 text-xs w-auto min-w-[120px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={gender}
          onValueChange={(v) => updateParam("gender", v)}
        >
          <SelectTrigger className="h-8 text-xs w-auto min-w-[100px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            {GENDER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={profession}
          onValueChange={(v) => updateParam("profession", v)}
        >
          <SelectTrigger className="h-8 text-xs w-auto min-w-[140px]">
            <SelectValue placeholder="Profession" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All professions</SelectItem>
            {professionsLoading ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : (
              professionOptions?.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" strokeWidth={1.5} />
          <Input
            value={locationCity}
            onChange={(e) => updateParam("location_city", e.target.value)}
            placeholder="City..."
            className="h-8 pl-8 pr-7 text-xs w-32"
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
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs text-brand hover:text-brand-hover hover:bg-brand-light"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Bulk action bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl p-3">
          <span className="text-sm text-text-secondary">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={handleBulkInvite}
            >
              <Mail className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
              Invite to Campaign
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 min-w-0">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-sm text-text-muted">
              No talent matches your filters.
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
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((profile) => {
                  const username = profile.username ?? "";
                  const displayName = profile.full_legal_name || profile.username || "Talent";
                  return (
                    <TalentGridCard
                      key={username}
                      profile={profile}
                      onViewProfile={() => router.push(`/talent/${username}`)}
                      onInvite={!selectMode ? () => {
                        if (profile.user_id) {
                          setSelectedTalent({ id: profile.user_id, name: displayName });
                          setInviteModalOpen(true);
                        }
                      } : undefined}
                      selectable={selectMode}
                      isSelected={profile.user_id ? selectedIds.has(profile.user_id) : false}
                      onToggleSelect={() => profile.user_id && toggleTalentSelection(profile.user_id)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((profile) => {
                  const username = profile.username ?? "";
                  const displayName = profile.full_legal_name || profile.username || "Talent";
                  return (
                    <TalentListRow
                      key={username}
                      profile={profile}
                      onViewProfile={() => router.push(`/talent/${username}`)}
                      onInvite={!selectMode ? () => {
                        if (profile.user_id) {
                          setSelectedTalent({ id: profile.user_id, name: displayName });
                          setInviteModalOpen(true);
                        }
                      } : undefined}
                      selectable={selectMode}
                      isSelected={profile.user_id ? selectedIds.has(profile.user_id) : false}
                      onToggleSelect={() => profile.user_id && toggleTalentSelection(profile.user_id)}
                    />
                  );
                })}
              </div>
            )}
            {hasNextPage && (
              <div ref={sentinelRef} className="py-4 flex justify-center">
                {isFetchingNextPage ? (
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-72 w-full rounded-2xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                      ))}
                    </div>
                  )
                ) : null}
              </div>
            )}
          </>
        )}
      </div>

      {(selectedTalent || selectMode) && (
        <InviteToCampaignModal
          open={inviteModalOpen}
          onClose={() => {
            setInviteModalOpen(false);
            setSelectedTalent(null);
            setSelectedIds(new Set());
            setSelectMode(false);
          }}
          talentId={selectedTalent?.id}
          talentIds={selectMode ? Array.from(selectedIds) : undefined}
          talentName={selectedTalent?.name}
        />
      )}
    </div>
  );
}
