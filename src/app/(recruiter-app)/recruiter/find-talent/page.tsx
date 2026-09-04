"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTalentSearch, useProfessions } from "@/hooks/use-talent-search";
import { TalentCard } from "@/components/find-talent/TalentCard";
import { TalentListSkeleton } from "@/components/find-talent/TalentListSkeleton";
import { FindTalentEmptyState } from "@/components/find-talent/FindTalentEmptyState";
import { FindTalentPagination } from "@/components/find-talent/FindTalentPagination";

const AVAILABILITY_OPTIONS = [
  { label: "All Availability", value: "" },
  { label: "Available", value: "available" },
  { label: "Busy", value: "busy" },
  { label: "Not Available", value: "not_available" },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name A-Z", value: "name_asc" },
  { label: "Name Z-A", value: "name_desc" },
];

const LIMIT = 10;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function RecruiterFindTalentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      search: searchQuery || undefined,
      profession: selectedProfession || undefined,
      location_city: selectedCity || undefined,
      availability: selectedAvailability || undefined,
      sort: sortBy as "newest" | "oldest" | "name_asc" | "name_desc",
      page: currentPage,
      limit: LIMIT,
    }),
    [searchQuery, selectedProfession, selectedCity, selectedAvailability, sortBy, currentPage],
  );

  const { data, isLoading, isPlaceholderData } = useTalentSearch(queryParams);
  const { data: professions } = useProfessions();

  const talents = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const activeFilters = useMemo(
    () => [
      {
        key: "profession",
        label: selectedProfession,
        value: selectedProfession,
        onRemove: () => {
          setSelectedProfession("");
          setCurrentPage(1);
        },
      },
      {
        key: "city",
        label: selectedCity,
        value: selectedCity,
        onRemove: () => {
          setSelectedCity("");
          setCurrentPage(1);
        },
      },
      {
        key: "availability",
        label: AVAILABILITY_OPTIONS.find((o) => o.value === selectedAvailability)?.label,
        value: selectedAvailability,
        onRemove: () => {
          setSelectedAvailability("");
          setCurrentPage(1);
        },
      },
    ],
    [selectedProfession, selectedCity, selectedAvailability],
  );

  const visibleFilters = activeFilters.filter((f) => f.value);
  const hasFilters = visibleFilters.length > 0 || searchQuery.length > 0;

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedProfession("");
    setSelectedCity("");
    setSelectedAvailability("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient hero glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(80%_60%_at_50%_0%,rgba(26,91,219,0.12),transparent_60%)]" />

      <div className="container-page relative pt-8 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              <span>AI-powered discovery</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Discover exceptional talent
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Search, filter, and shortlist verified performers, models, and creators for your next campaign.
            </p>
          </div>
          <Button
            size="lg"
            className="shrink-0 gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-button transition-all hover:bg-primary/90 hover:shadow-button-hover active:scale-[0.98]"
          >
            <Plus className="size-4" />
            Invite Talent
          </Button>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <div className="rounded-2xl border border-border/60 bg-surface/80 p-4 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.5)] backdrop-blur-md md:p-5">
            {/* Search bar */}
            <div className="flex items-center gap-3">
              <div className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-muted/60 px-4 py-3 shadow-[var(--shadow-search)] transition-colors focus-within:border-primary/50 focus-within:bg-muted focus-within:ring-1 focus-within:ring-primary/20">
                <Search className="size-5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search by name, profession, skills, or location..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-auto border-0 bg-transparent p-0 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="hidden size-11 shrink-0 rounded-xl border-border bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground md:inline-flex"
                aria-label="More filters"
              >
                <SlidersHorizontal className="size-4" />
              </Button>
            </div>

            {/* Filter bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Select
                value={selectedProfession}
                onValueChange={(value) => {
                  setSelectedProfession(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 gap-2 rounded-lg border-border bg-surface/60 pl-3 pr-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground data-[state=open]:border-primary/40 data-[state=open]:text-foreground">
                  <span className="text-muted-foreground/70">Profession</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover">
                  <SelectItem value="">All Professions</SelectItem>
                  {professions?.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 text-sm transition-colors focus-within:border-primary/40 focus-within:bg-surface hover:bg-surface">
                <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                <input
                  placeholder="City"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-24 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none md:w-32"
                />
                {selectedCity && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity("");
                      setCurrentPage(1);
                    }}
                    className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                    aria-label="Clear city filter"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              <Select
                value={selectedAvailability}
                onValueChange={(value) => {
                  setSelectedAvailability(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 gap-2 rounded-lg border-border bg-surface/60 pl-3 pr-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground data-[state=open]:border-primary/40 data-[state=open]:text-foreground">
                  <span className="text-muted-foreground/70">Availability</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mx-1 hidden h-6 w-px bg-border md:block" />

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="h-9 gap-2 rounded-lg border-border bg-surface/60 pl-3 pr-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground data-[state=open]:border-primary/40 data-[state=open]:text-foreground">
                  <span className="text-muted-foreground/70">Sort</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover">
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg border-border bg-surface/60 text-xs text-muted-foreground hover:bg-surface hover:text-foreground md:hidden"
              >
                <SlidersHorizontal className="mr-1.5 size-3.5" />
                Filters
              </Button>
            </div>

            {/* Active filter chips */}
            <AnimatePresence mode="popLayout">
              {visibleFilters.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
                    <span className="text-xs font-medium text-muted-foreground">Active:</span>
                    {visibleFilters.map((filter) => (
                      <Badge
                        key={filter.key}
                        variant="secondary"
                        className="group cursor-pointer gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:border-border-hover hover:bg-elevated"
                        onClick={filter.onRemove}
                      >
                        {filter.label}
                        <X className="size-3 text-muted-foreground transition-colors group-hover:text-foreground" />
                      </Badge>
                    ))}
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="ml-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Clear all
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="mt-6 flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
                Searching talent...
              </span>
            ) : (
              <>
                <span className="font-semibold text-foreground">{total.toLocaleString()}</span>{" "}
                talent{total !== 1 ? "s" : ""} found
              </>
            )}
          </p>
        </motion.div>

        {/* Talent list */}
        <div className={`mt-5 ${isPlaceholderData ? "opacity-70 transition-opacity duration-300" : ""}`}>
          {isLoading ? (
            <TalentListSkeleton />
          ) : talents.length === 0 ? (
            <FindTalentEmptyState hasFilters={hasFilters} onClearFilters={clearAllFilters} />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {talents.map((t) => (
                <motion.div key={t._id} variants={itemVariants}>
                  <TalentCard talent={t} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && talents.length > 0 && (
          <FindTalentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
