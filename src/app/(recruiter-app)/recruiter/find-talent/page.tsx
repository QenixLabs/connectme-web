"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  Bookmark,
  BookmarkPlus,
  Clock,
  Drama,
  Languages,
  MapPin,
  Mic,
  Search,
  Sparkles,
  Star,
  CalendarDays,
  Award,
  User,
  X,
} from "lucide-react";
import { FilterSelect } from "@/components/find-talent/FilterSelect";
import { useProfessions } from "@/hooks/use-talent-search";
import {
  useClearRecentSearches,
  useDeleteSavedSearch,
  useMarkSavedSearchViewed,
  useSavedSearches,
} from "@/hooks/use-saved-searches";
import {
  AGE_BANDS,
  AVAILABILITY_OPTIONS,
  EXPERIENCE_BANDS,
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  SKILL_OPTIONS,
  availabilityLabel,
  bandToRange,
  emptyCriteria,
  hasAnyCriteria,
  toSearchParams,
  type SearchCriteria,
} from "@/lib/find-talent/search-model";
import type { SavedSearch } from "@/lib/api/saved-searches";
import { fromSavedSearchCriteria } from "@/lib/api/saved-searches";

const CITY_OPTIONS = [
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Bengaluru",
  "Kolkata",
  "Pune",
  "Remote",
];

/** Preset shortcuts — each is just a real filter combination. */
const POPULAR: { title: string; lines: string[]; criteria: SearchCriteria }[] = [
  {
    title: "Female Actor",
    lines: ["25–30", "Mumbai"],
    criteria: { ...emptyCriteria, profession: "Actor", gender: "Female", ageMin: 25, ageMax: 30, location: "Mumbai" },
  },
  {
    title: "Male Model",
    lines: ["20–28", "Delhi"],
    criteria: { ...emptyCriteria, profession: "Model", gender: "Male", ageMin: 20, ageMax: 28, location: "Delhi" },
  },
  {
    title: "Voice Artist",
    lines: ["Hindi", "Remote"],
    criteria: { ...emptyCriteria, profession: "Voice Artist", languages: ["Hindi"], location: "Remote" },
  },
  {
    title: "Dancer",
    lines: ["18–25", "Mumbai"],
    criteria: { ...emptyCriteria, profession: "Dancer", ageMin: 18, ageMax: 25, location: "Mumbai" },
  },
];

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

export default function RecruiterFindTalentPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchCriteria>(emptyCriteria);

  const { data: professions } = useProfessions();
  const { data: recent, isLoading: recentLoading } = useSavedSearches("recent");
  const { data: saved, isLoading: savedLoading } = useSavedSearches("saved");
  const clearRecent = useClearRecentSearches();
  const markViewed = useMarkSavedSearchViewed();
  const deleteSaved = useDeleteSavedSearch();

  const goToResults = (criteria: SearchCriteria) =>
    router.push(`/recruiter/find-talent/results?${new URLSearchParams(toSearchParams(criteria)).toString()}`);

  const set = (patch: Partial<SearchCriteria>) => setFilters((prev) => ({ ...prev, ...patch }));

  const submitSearch = () => {
    if (!query.trim() && hasAnyCriteria(filters)) {
      goToResults(filters);
      return;
    }
    if (query.trim()) goToResults({ ...emptyCriteria, search: query.trim() });
  };

  const ageBand =
    filters.ageMin != null && filters.ageMax != null ? `${filters.ageMin}–${filters.ageMax}` : "";
  const experienceBand = EXPERIENCE_BANDS.find(
    (b) => b.min === filters.experienceMin && b.max === filters.experienceMax,
  )?.label;

  const openSaved = (s: SavedSearch) => {
    if (s.new_results && s.new_results > 0) markViewed.mutate(s.id);
    goToResults(fromSavedSearchCriteria(s.criteria));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient hero glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(80%_60%_at_50%_0%,rgba(26,91,219,0.12),transparent_60%)]" />

      <div className="container-page relative pt-8 pb-16">
        {/* Header */}
        <header className="relative isolate min-h-[220px] overflow-hidden rounded-[2rem] border border-border/60 bg-surface px-6 py-8 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.35)] md:px-8 md:py-10">
          <Image
            src="/find-talent-hero.png"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="absolute inset-0 z-0 size-full object-cover object-center"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/95 via-background/80 to-background/10" />
          <div className="relative z-20 w-full md:w-3/5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              <span>AI-powered discovery</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Find Talent
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Describe the talent you need or pick your filters — search real, verified profiles.
            </p>
          </div>
        </header>

        {/* AI search bar */}
        <div className="mt-6 flex items-center gap-3 rounded-3xl border border-border/60 bg-surface p-3 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.5)]">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </span>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Describe the talent you need</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              placeholder="Describe the talent you need..."
              className="w-full bg-transparent text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground/90"
            />
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              e.g. Female actor, 25–30, Hindi + Telugu, Mumbai or Hyderabad.
            </span>
          </label>
          <button
            type="button"
            aria-label="Search by voice"
            className="grid size-10 shrink-0 place-items-center rounded-xl text-primary hover:bg-primary/10"
          >
            <Mic className="size-5" />
          </button>
          <button
            type="button"
            onClick={submitSearch}
            aria-label="Search talent"
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-button transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <Search className="size-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FilterSelect
            label="Profession"
            icon={Drama}
            value={filters.profession}
            options={professions ?? []}
            onSelect={(v) => set({ profession: v })}
          />
          <FilterSelect
            label="Location"
            icon={MapPin}
            value={filters.location}
            options={CITY_OPTIONS}
            onSelect={(v) => set({ location: v })}
          />
          <FilterSelect
            label="Age"
            icon={CalendarDays}
            value={ageBand}
            options={AGE_BANDS}
            onSelect={(v) => {
              const [min, max] = bandToRange(v);
              set({ ageMin: min, ageMax: max });
            }}
          />
          <FilterSelect
            label="Gender"
            icon={User}
            value={filters.gender}
            options={GENDER_OPTIONS}
            onSelect={(v) => set({ gender: v })}
          />
          <FilterSelect
            label="Language"
            icon={Languages}
            value={filters.languages[0]}
            options={LANGUAGE_OPTIONS}
            onSelect={(v) => set({ languages: v ? [v] : [] })}
          />
          <FilterSelect
            label="Experience"
            icon={Award}
            value={experienceBand}
            options={EXPERIENCE_BANDS.map((b) => b.label)}
            onSelect={(v) => {
              const band = EXPERIENCE_BANDS.find((b) => b.label === v);
              set({ experienceMin: band?.min ?? null, experienceMax: band?.max ?? null });
            }}
          />
          <FilterSelect
            label="Availability"
            icon={Clock}
            value={availabilityLabel(filters.availability)}
            options={AVAILABILITY_OPTIONS.map((o) => o.label)}
            onSelect={(v) =>
              set({ availability: AVAILABILITY_OPTIONS.find((o) => o.label === v)?.value ?? "" })
            }
          />
          <FilterSelect
            label="Skills"
            icon={Sparkles}
            value={filters.skills[0]}
            options={SKILL_OPTIONS}
            onSelect={(v) => set({ skills: v ? [v] : [] })}
          />
        </div>

        {hasAnyCriteria(filters) && (
          <button
            type="button"
            onClick={() => goToResults(filters)}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground shadow-button transition-all hover:bg-primary/90 active:scale-[0.99]"
          >
            <Search className="size-5" /> Search with these filters
            <ArrowRight className="size-5" />
          </button>
        )}

        {/* Popular */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-foreground">Popular Searches</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {POPULAR.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => goToResults(p.criteria)}
                className="flex items-start gap-2.5 rounded-2xl bg-primary/5 p-3 text-left ring-1 ring-primary/10 transition-colors hover:bg-primary/10"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-primary">
                  <Search className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-foreground">{p.title}</span>
                  {p.lines.map((l) => (
                    <span key={l} className="block text-xs text-muted-foreground">
                      {l}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Recent */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-extrabold text-foreground">Recent Searches</h2>
            {(recent?.length ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => clearRecent.mutate()}
                className="text-sm font-bold text-primary transition-colors hover:text-primary/80"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="mt-3 space-y-3">
            {recentLoading ? (
              <div className="h-16 animate-pulse rounded-2xl bg-surface ring-1 ring-border/70" />
            ) : (recent?.length ?? 0) === 0 ? (
              <p className="rounded-2xl border border-border/70 bg-surface p-4 text-sm text-muted-foreground">
                No recent searches yet. Your searches will appear here.
              </p>
            ) : (
              recent!.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => goToResults(fromSavedSearchCriteria(r.criteria))}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-surface p-3 text-left transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)]"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Clock className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">{r.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[r.subtitle, timeAgo(r.last_run_at)].filter(Boolean).join(" • ")}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </section>

        {/* Saved */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-extrabold text-foreground">Saved Searches</h2>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
              <BookmarkPlus className="size-4" /> Save from results
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {savedLoading ? (
              <div className="h-16 animate-pulse rounded-2xl bg-surface ring-1 ring-border/70" />
            ) : (saved?.length ?? 0) === 0 ? (
              <p className="rounded-2xl border border-border/70 bg-surface p-4 text-sm text-muted-foreground">
                Save a search from the results screen to get alerts on new talent.
              </p>
            ) : (
              saved!.map((s) => (
                <div
                  key={s.id}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-surface p-3 text-left transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)]"
                >
                  <button
                    type="button"
                    onClick={() => openSaved(s)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Bookmark className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-foreground">{s.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{s.subtitle}</span>
                    </span>
                    {s.new_results && s.new_results > 0 ? (
                      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                        New results ({s.new_results})
                      </span>
                    ) : (
                      <Star className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSaved.mutate(s.id)}
                    aria-label={`Delete saved search ${s.title}`}
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
