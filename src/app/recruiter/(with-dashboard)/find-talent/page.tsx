"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
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
  Loader2,
  Users,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/formatters";
import { useTalentSearch } from "@/lib/api/hooks/useTalentSearch";
import { useDistinctProfessions } from "@/lib/api/hooks/useDistinctProfessions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useCreateCollaborationRequest } from "@/lib/api/hooks/useCreateCollaborationRequest";
import { messagesApi } from "@/lib/api/messages";
import { usePopup } from "@/hooks/use-popup";
import { useTierGuard } from "@/hooks/use-tier-guard";

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

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
];

export default function FindTalentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<{ id: string; name: string } | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [toolbarStuck, setToolbarStuck] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const toolbarSentinelRef = useRef<HTMLDivElement>(null);

  const createRequest = useCreateCollaborationRequest();
  const popup = usePopup();
  const { guard } = useTierGuard(3);

  const handleConnect = useCallback(
    (profile: {
      user_id?: string;
      username?: string;
      full_legal_name?: string;
      privacy_mode?: string;
    }) => {
      const talentId = profile.user_id;
      if (!talentId) return;

      guard(() => {
        if (profile.privacy_mode === "private") {
          const name = profile.full_legal_name || profile.username || "Talent";
          createRequest.mutate({ receiverId: talentId, reason: "collaboration" }, {
            onSuccess: () => {
              popup.show({
                title: "Request sent",
                description: `Collaboration request sent to ${name}. You can message once they accept.`,
                variant: "success",
              });
            },
            onError: (err: unknown) => {
              const e = err as { response?: { data?: { message?: string } } };
              const msg = e?.response?.data?.message || "";
              if (msg.toLowerCase().includes("already accepted")) {
                messagesApi
                  .startDirectConversation(talentId)
                  .then(({ conversation }) => {
                    router.push(`/recruiter/messages?conversationId=${conversation._id}`);
                  })
                  .catch((err2) => {
                    popup.show({
                      title: "Could not open messages",
                      description: getApiErrorMessage(err2, "Something went wrong"),
                      variant: "error",
                    });
                  });
              } else if (msg.toLowerCase().includes("already pending")) {
                popup.show({
                  title: "Request pending",
                  description: "You already have a pending request with this talent.",
                  variant: "info",
                });
              } else {
                popup.show({
                  title: "Failed to send request",
                  description: getApiErrorMessage(err, "Something went wrong"),
                  variant: "error",
                });
              }
            },
          });
          return;
        }

        messagesApi
          .startDirectConversation(talentId)
          .then(({ conversation }) => {
            const draft =
              "Hi, I came across your profile and would love to connect regarding a potential opportunity. Looking forward to hearing from you!";
            router.push(
              `/recruiter/messages?conversationId=${conversation._id}&draft=${encodeURIComponent(draft)}`,
            );
          })
          .catch((err) => {
            popup.show({
              title: "Could not start conversation",
              description: getApiErrorMessage(err, "Something went wrong"),
              variant: "error",
            });
          });
      });
    },
    [createRequest, popup, router, guard],
  );

  const profession = searchParams.get("profession") || "all";
  const availability = searchParams.get("availability") || "all";
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
    setSearch("");
    setDebouncedSearch("");
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
    guard(() => setInviteModalOpen(true));
  }, [selectedIds, guard]);

  const hasActiveFilters =
    profession !== "all" || availability !== "all" || gender !== "all" || !!locationCity || !!debouncedSearch;

  const filters = useMemo(
    () => ({
      profession: profession === "all" ? undefined : profession,
      availability: availability === "all" ? undefined : availability,
      gender: gender === "all" ? undefined : gender,
      location_city: locationCity || undefined,
      search: debouncedSearch || undefined,
      sort,
    }),
    [profession, availability, gender, locationCity, debouncedSearch, sort],
  );

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    error,
  } = useTalentSearch(filters);

  const { data: professionOptions, isLoading: professionsLoading } =
    useDistinctProfessions("");

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const sentinel = toolbarSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setToolbarStuck(!entry.isIntersecting);
      },
      { threshold: 1, rootMargin: "-49px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const allProfiles = useMemo(
    () => (data ? data.pages.flatMap((p) => p.data) : []),
    [data],
  );

  const totalResultCount = data?.pages?.[0]?.total || allProfiles.length;

  const availableCount = useMemo(
    () => allProfiles.filter((p) => p.availability === "available").length,
    [allProfiles],
  );

  /* ------------------------------------------------------------------ */
  /*  LOADING STATE                                                     */
  /* ------------------------------------------------------------------ */
  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-6 pb-24 lg:pb-8">
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-14 w-full rounded-2xl mb-5" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  ERROR STATE                                                       */
  /* ------------------------------------------------------------------ */
  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(error, "Failed to load talent")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  ACTIVE FILTER CHIPS                                               */
  /* ------------------------------------------------------------------ */
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (profession !== "all")
    activeChips.push({ key: "profession", label: profession, onRemove: () => updateParam("profession", "all") });
  if (availability !== "all")
    activeChips.push({ key: "availability", label: availability.replace("_", " "), onRemove: () => updateParam("availability", "all") });
  if (gender !== "all")
    activeChips.push({ key: "gender", label: gender, onRemove: () => updateParam("gender", "all") });
  if (locationCity)
    activeChips.push({ key: "location", label: locationCity, onRemove: () => updateParam("location_city", "") });

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-6 pb-24 lg:pb-8 flex flex-col gap-5">
      {/* -------- Select mode banner -------- */}
      {selectMode && selectedIds.size > 0 && (
        <div className="sticky top-[49px] z-40 flex items-center justify-between gap-3 rounded-2xl bg-surface-dark px-5 py-3.5 text-on-surface-dark shadow-luxe-lg">
          <span className="text-sm font-semibold">
            {selectedIds.size} talent selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-9 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="h-9 rounded-xl text-xs bg-gold text-surface-dark hover:bg-gold-bright font-semibold"
              onClick={handleBulkInvite}
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
              Invite to Campaign
            </Button>
          </div>
        </div>
      )}

      {/* -------- Header + stats summary -------- */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-ink">
              Find Talent
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Discover and connect with professionals across the platform
            </p>
          </div>
          {totalResultCount > 0 && (
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-ink">{totalResultCount}</p>
                <p className="text-2xs uppercase tracking-wider text-ink-muted">Total</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-semibold text-emerald-600">{availableCount}</p>
                <p className="text-2xs uppercase tracking-wider text-ink-muted">Available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* -------- Sentinel for sticky detection -------- */}
      <div ref={toolbarSentinelRef} className="h-0" />

      {/* -------- Toolbar -------- */}
      <div
        ref={toolbarRef}
        className={cn(
          "flex flex-col gap-3",
          toolbarStuck &&
            "sticky top-[49px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/95 backdrop-blur-sm border-b border-border/60",
        )}
      >
        {/* Search bar */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none"
            strokeWidth={1.5}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder="Search by name, profession, or keyword..."
            aria-label="Search talent"
            className="h-12 rounded-2xl border-border/60 bg-card pl-11 pr-10 text-sm shadow-luxe placeholder:text-ink-muted/60 focus-visible:ring-gold/30"
          />
          {isFetching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-ink-muted" />
          )}
          {search && !isFetching && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-muted hover:text-ink transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Filters row */}
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 pb-0.5">
          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-border/60 bg-card p-0.5 mr-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                viewMode === "grid"
                  ? "bg-ink text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                viewMode === "list"
                  ? "bg-ink text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="w-px h-6 bg-border/60 mx-0.5" />

          <Select
            value={availability}
            onValueChange={(v) => updateParam("availability", v)}
          >
            <SelectTrigger className="h-9 rounded-xl border-border/60 bg-card text-xs w-auto min-w-[120px] shadow-luxe hover:border-brand/30 transition-colors data-[state=open]:border-brand">
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
            <SelectTrigger className="h-9 rounded-xl border-border/60 bg-card text-xs w-auto min-w-[100px] shadow-luxe hover:border-brand/30 transition-colors data-[state=open]:border-brand">
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
            <SelectTrigger className="h-9 rounded-xl border-border/60 bg-card text-xs w-auto min-w-[140px] shadow-luxe hover:border-brand/30 transition-colors data-[state=open]:border-brand">
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
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted pointer-events-none" strokeWidth={1.5} />
            <Input
              value={locationCity}
              onChange={(e) => updateParam("location_city", e.target.value)}
              placeholder="City..."
              className="h-9 rounded-xl border-border/60 bg-card pl-8 pr-8 text-xs w-32 shadow-luxe focus-visible:ring-gold/30"
            />
            {locationCity && (
              <button
                onClick={() => updateParam("location_city", "")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            )}
          </div>

          <Select
            value={sort}
            onValueChange={(v) => updateParam("sort", v)}
          >
            <SelectTrigger className="h-9 rounded-xl border-border/60 bg-card text-xs w-auto min-w-[120px] shadow-luxe hover:border-brand/30 transition-colors data-[state=open]:border-brand">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 shrink-0 rounded-xl text-xs font-medium text-ink-muted hover:text-ink hover:bg-cream-deep/60"
            >
              <X className="h-3 w-3 mr-1" strokeWidth={2} />
              Clear all
            </Button>
          )}

          <button
            onClick={toggleSelectMode}
            className={cn(
              "ml-auto flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-all duration-200",
              selectMode
                ? "border-ink bg-ink text-white shadow-sm"
                : "border-border/60 bg-card text-ink-muted hover:text-ink hover:border-border shadow-luxe"
            )}
          >
            {selectMode ? (
              <>
                <CheckSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                Done
              </>
            ) : (
              <>
                <Square className="h-3.5 w-3.5" strokeWidth={1.5} />
                Select
              </>
            )}
          </button>
        </div>
        </ScrollArea>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-3 w-3 text-ink-muted mr-0.5" strokeWidth={1.5} />
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="secondary"
                className="h-7 rounded-lg gap-1.5 pl-2.5 pr-1.5 text-xs font-medium bg-gold-soft text-gold-ink border-gold/20 hover:bg-gold-soft/80 cursor-default"
              >
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  className="ml-0.5 rounded-md p-0.5 hover:bg-gold/20 transition-colors"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* -------- Results -------- */}
      <div className="flex-1 min-w-0">
        {allProfiles.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-cream-pale/50 px-6 py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-soft shadow-luxe">
              <Users className="h-7 w-7 text-gold-ink" strokeWidth={1.5} />
            </div>
            <p className="text-base font-semibold text-ink">
              No talent matches your filters
            </p>
            <p className="mt-1.5 max-w-sm text-sm text-ink-muted leading-relaxed">
              Try broadening your search by adjusting or clearing your filters. There are many talented professionals waiting to be discovered.
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                className="mt-5 h-10 rounded-xl bg-ink text-white hover:bg-ink-hover shadow-sm text-sm font-medium px-5"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allProfiles.map((profile) => {
                  const username = profile.username ?? "";
                  const displayName = profile.full_legal_name || profile.username || "Talent";
                  return (
                    <TalentGridCard
                      key={username}
                      profile={profile}
                      matchScore={profile.match_score}
                      campaignName={profile.matched_campaign}
                      onViewProfile={() => router.push(`/talent/${username}`)}
                      onInvite={!selectMode ? () => {
                        guard(() => {
                          if (profile.user_id) {
                            setSelectedTalent({ id: profile.user_id, name: displayName });
                            setInviteModalOpen(true);
                          }
                        });
                      } : undefined}
                      onConnect={!selectMode && profile.user_id ? () => handleConnect(profile) : undefined}
                      selectable={selectMode}
                      isSelected={profile.user_id ? selectedIds.has(profile.user_id) : false}
                      onToggleSelect={() => profile.user_id && toggleTalentSelection(profile.user_id)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {allProfiles.map((profile) => {
                  const username = profile.username ?? "";
                  const displayName = profile.full_legal_name || profile.username || "Talent";
                  return (
                    <TalentListRow
                      key={username}
                      profile={profile}
                      matchScore={profile.match_score}
                      campaignName={profile.matched_campaign}
                      onViewProfile={() => router.push(`/talent/${username}`)}
                      onInvite={!selectMode ? () => {
                        guard(() => {
                          if (profile.user_id) {
                            setSelectedTalent({ id: profile.user_id, name: displayName });
                            setInviteModalOpen(true);
                          }
                        });
                      } : undefined}
                      onConnect={!selectMode && profile.user_id ? () => handleConnect(profile) : undefined}
                      selectable={selectMode}
                      isSelected={profile.user_id ? selectedIds.has(profile.user_id) : false}
                      onToggleSelect={() => profile.user_id && toggleTalentSelection(profile.user_id)}
                    />
                  );
                })}
              </div>
            )}
            <div ref={sentinelRef} className="py-6 flex justify-center">
              {isFetchingNextPage && (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-[72px] rounded-xl" />
                    ))}
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* -------- Invite modal -------- */}
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
