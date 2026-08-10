"use client";

import { useState, useMemo } from "react";
import {
  ChevronRight,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  const hasFilters = !!(searchQuery || selectedProfession || selectedCity || selectedAvailability);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Find Talent</h1>
          <p className="mt-1 text-sm text-slate-400">
            Discover and connect with verified talent for your campaigns.
          </p>
        </div>
        <Button className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-medium text-[#050b14] hover:bg-teal-400">
          <Plus className="size-4" />
          Invite Talent
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex min-w-[240px] flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-[#0a1420] px-4 py-2.5">
            <Search className="size-4 shrink-0 text-slate-500" />
            <Input
              placeholder="Search by name, skills, role or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="border-0 bg-transparent text-sm text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-slate-700 text-slate-400 hover:text-white"
          >
            <SlidersHorizontal className="mr-1.5 size-4" />
            Filters
          </Button>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {/* Profession filter */}
          <div className="relative">
            <select
              value={selectedProfession}
              onChange={(e) => {
                setSelectedProfession(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-700 bg-[#0a1420] px-4 py-2.5 pr-8 text-sm text-slate-400 transition-colors hover:text-white focus:border-teal-700 focus:outline-none"
            >
              <option value="">All Professions</option>
              {professions?.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 rotate-90 text-slate-500" />
          </div>

          {/* Location filter */}
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0a1420] px-4 py-2.5">
              <MapPin className="size-4 shrink-0 text-slate-500" />
              <input
                placeholder="Location"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-28 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Availability filter */}
          <div className="relative">
            <select
              value={selectedAvailability}
              onChange={(e) => {
                setSelectedAvailability(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-700 bg-[#0a1420] px-4 py-2.5 pr-8 text-sm text-slate-400 transition-colors hover:text-white focus:border-teal-700 focus:outline-none"
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 rotate-90 text-slate-500" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-xl border border-slate-700 bg-[#0a1420] px-4 py-2.5 pr-8 text-sm text-slate-400 transition-colors hover:text-white focus:border-teal-700 focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 rotate-90 text-slate-500" />
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-xs text-slate-500">
            {total} talent{total !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* Talent list */}
      <div
        className={`mt-6 space-y-4 ${isPlaceholderData ? "opacity-60 transition-opacity" : ""}`}
      >
        {isLoading ? (
          <TalentListSkeleton />
        ) : talents.length === 0 ? (
          <FindTalentEmptyState hasFilters={hasFilters} />
        ) : (
          talents.map((t) => <TalentCard key={t._id} talent={t} />)
        )}
      </div>

      {/* Pagination */}
      <FindTalentPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
