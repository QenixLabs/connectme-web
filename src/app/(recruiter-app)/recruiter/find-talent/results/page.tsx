"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TalentCard } from "@/components/find-talent/TalentCard";
import { TalentListSkeleton } from "@/components/find-talent/TalentListSkeleton";
import { FindTalentEmptyState } from "@/components/find-talent/FindTalentEmptyState";
import { useTalentSearch, useProfessions } from "@/hooks/use-talent-search";
import { useSavedSearches, useUpsertSavedSearch } from "@/hooks/use-saved-searches";
import {
  AGE_BANDS,
  AVAILABILITY_OPTIONS,
  EXPERIENCE_BANDS,
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  SKILL_OPTIONS,
  bandToRange,
  criteriaChips,
  criteriaSummary,
  emptyCriteria,
  hasAnyCriteria,
  parseCriteria,
  removeChip,
  toApiParams,
  toSearchParams,
  type SearchCriteria,
} from "@/lib/find-talent/search-model";
import { fromSavedSearchCriteria, toSavedSearchCriteria } from "@/lib/api/saved-searches";

const LIMIT = 12;

const SORT_OPTIONS = [
  { label: "Best Match", value: "relevance" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name A-Z", value: "name_asc" },
  { label: "Name Z-A", value: "name_desc" },
] as const;

function FindTalentResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const recordedSig = useRef("");
  const initialCriteria = useMemo(
    () => parseCriteria(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>("relevance");

  const queryParams = useMemo(
    () => ({
      ...toApiParams(criteria),
      sort: sortBy,
      limit: LIMIT,
    }),
    [criteria, sortBy],
  );
  const search = useTalentSearch(queryParams);
  const {
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = search;
  const { data: professions } = useProfessions();
  const { data: saved } = useSavedSearches("saved");
  const upsertSearch = useUpsertSavedSearch();

  const talents = search.data?.pages.flatMap((page) => page.data) ?? [];
  const total = search.data?.pages[0]?.total ?? 0;
  const criteriaSig = new URLSearchParams(toSearchParams(criteria)).toString();
  const chips = criteriaChips(criteria);
  const savedMatch = saved?.find(
    (item) =>
      new URLSearchParams(toSearchParams(fromSavedSearchCriteria(item.criteria))).toString() ===
      criteriaSig,
  );
  const ageBand =
    criteria.ageMin != null && criteria.ageMax != null
      ? `${criteria.ageMin}–${criteria.ageMax}`
      : "";
  const experienceBand = EXPERIENCE_BANDS.find(
    (band) => band.min === criteria.experienceMin && band.max === criteria.experienceMax,
  )?.label;

  const set = (patch: Partial<SearchCriteria>) => {
    setCriteria((previous) => ({ ...previous, ...patch }));
  };

  const clearAllFilters = () => {
    setCriteria(emptyCriteria);
    setSortBy("relevance");
  };

  const toggleSave = () => {
    if (!hasAnyCriteria(criteria)) return;
    upsertSearch.mutate({
      kind: "saved",
      title: criteriaSummary(criteria),
      subtitle: criteria.location || undefined,
      criteria: toSavedSearchCriteria(criteria),
      result_count: total,
    });
  };

  useEffect(() => {
    if (search.isFetching || !hasAnyCriteria(criteria) || recordedSig.current === criteriaSig) return;
    recordedSig.current = criteriaSig;
    upsertSearch.mutate({
      kind: "recent",
      title: criteriaSummary(criteria),
      subtitle: criteria.location || undefined,
      criteria: toSavedSearchCriteria(criteria),
      result_count: total,
    });
    // Search history is recorded once after each criteria query settles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteriaSig, search.isFetching, total]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage || isFetching || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetching && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "480px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, talents.length]);

  return (
    <div className="min-h-screen bg-[image:var(--gradient-page)]">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">


        <section className="rounded-2xl border border-border/60 bg-card/80 p-3 shadow-[var(--shadow-card)] backdrop-blur-md sm:p-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/60 px-4 py-3 focus-within:border-primary/50">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <Input
              value={criteria.search}
              onChange={(event) => set({ search: event.target.value })}
              placeholder="Search by name, profession, skills, or location..."
              className="h-auto border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
            />
            {criteria.search && (
              <button type="button" onClick={() => set({ search: "" })} aria-label="Clear search">
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <Button
              type="button"
              variant="outline"
              className="h-10 shrink-0 gap-2 rounded-xl border-primary/40 bg-card text-primary"
            >
              <SlidersHorizontal className="size-4" /> Filters
            </Button>
            <Select value={criteria.profession} onValueChange={(value) => set({ profession: value })}>
              <SelectTrigger className="h-10 w-auto shrink-0 gap-2 rounded-xl border-border bg-card px-3 text-sm">
                <span className="text-muted-foreground">Profession</span>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All professions</SelectItem>
                {professions?.map((profession) => <SelectItem key={profession} value={profession}>{profession}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={criteria.gender} onValueChange={(value) => set({ gender: value })}>
              <SelectTrigger className="h-10 w-auto shrink-0 gap-2 rounded-xl border-border bg-card px-3 text-sm">
                <span className="text-muted-foreground">Gender</span><SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All genders</SelectItem>
                {GENDER_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={ageBand} onValueChange={(value) => { const [ageMin, ageMax] = bandToRange(value); set({ ageMin, ageMax }); }}>
              <SelectTrigger className="h-10 w-auto shrink-0 gap-2 rounded-xl border-border bg-card px-3 text-sm">
                <span className="text-muted-foreground">Age</span><SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any age</SelectItem>
                {AGE_BANDS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={criteria.languages[0] ?? ""} onValueChange={(value) => set({ languages: value ? [value] : [] })}>
              <SelectTrigger className="h-10 w-auto shrink-0 gap-2 rounded-xl border-border bg-card px-3 text-sm">
                <span className="text-muted-foreground">Language</span><SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any language</SelectItem>
                {LANGUAGE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={experienceBand ?? ""} onValueChange={(value) => { const band = EXPERIENCE_BANDS.find((item) => item.label === value); set({ experienceMin: band?.min ?? null, experienceMax: band?.max ?? null }); }}>
              <SelectTrigger className="h-10 w-auto shrink-0 gap-2 rounded-xl border-border bg-card px-3 text-sm">
                <span className="text-muted-foreground">Experience</span><SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any experience</SelectItem>
                {EXPERIENCE_BANDS.map((option) => <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={criteria.availability} onValueChange={(value) => set({ availability: value })}>
              <SelectTrigger className="h-10 w-auto shrink-0 gap-2 rounded-xl border-border bg-card px-3 text-sm">
                <span className="text-muted-foreground">Availability</span><SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All availability</SelectItem>
                {AVAILABILITY_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={criteria.skills[0] ?? ""} onValueChange={(value) => set({ skills: value ? [value] : [] })}>
              <SelectTrigger className="h-10 w-auto shrink-0 gap-2 rounded-xl border-border bg-card px-3 text-sm">
                <span className="text-muted-foreground">Skills</span><SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any skill</SelectItem>
                {SKILL_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence initial={false}>
            {chips.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                <span className="text-xs font-medium text-muted-foreground">Active:</span>
                {chips.map((chip) => (
                  <Badge key={`${chip.key}-${chip.value ?? chip.label}`} variant="secondary" className="cursor-pointer gap-1 rounded-full px-2.5 py-1" onClick={() => setCriteria(removeChip(criteria, chip))}>
                    {chip.label}<X className="size-3" />
                  </Badge>
                ))}
                <button type="button" onClick={clearAllFilters} className="text-xs font-semibold text-primary">Clear all</button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {search.isFetching && talents.length === 0 ? "Searching talent..." : <><span className="font-semibold text-foreground">{total.toLocaleString()}</span> talent{total === 1 ? "" : "s"} found</>}
          </p>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">Sort by</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="h-10 w-auto gap-2 rounded-xl border-primary/40 bg-card px-3 text-sm font-semibold text-primary"><SelectValue /><ChevronDown className="size-4" /></SelectTrigger>
              <SelectContent>{SORT_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={toggleSave} disabled={!hasAnyCriteria(criteria)} className="size-10 rounded-xl border-primary/40 p-0 text-primary sm:hidden" aria-label="Save search">
              {savedMatch ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
            </Button>
          </div>
        </div>

        {search.isError ? (
          <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
            <p className="font-semibold text-foreground">We couldn&apos;t load talent right now.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
            <Button type="button" variant="outline" onClick={() => search.refetch()} className="mt-5 rounded-xl">Try again</Button>
          </div>
        ) : search.isPending ? (
          <div className="mt-5"><TalentListSkeleton /></div>
        ) : talents.length === 0 ? (
          <div className="mt-5"><FindTalentEmptyState hasFilters={hasAnyCriteria(criteria)} onClearFilters={clearAllFilters} /></div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: search.isFetching ? 0.65 : 1 }} className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {talents.map((talent) => <TalentCard key={talent._id} talent={talent} />)}
          </motion.div>
        )}

        <div ref={loadMoreRef} className="flex min-h-16 items-center justify-center py-5" aria-live="polite">
          {search.isFetchingNextPage && <span className="text-sm text-muted-foreground">Loading more talent...</span>}
          {!search.hasNextPage && talents.length > 0 && <span className="text-xs text-muted-foreground">You&apos;ve reached the end of the results.</span>}
        </div>
      </div>
    </div>
  );
}

export default function RecruiterFindTalentResultsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 pb-16 pt-8"><TalentListSkeleton /></div>}>
      <FindTalentResultsInner />
    </Suspense>
  );
}
