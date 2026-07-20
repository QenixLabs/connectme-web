"use client";

import { useMemo } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  BookmarkCheck,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EnrichedApplication } from "../campaign-application-card";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "match_desc", label: "Match score" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
];

interface ApplicantFiltersSidebarProps {
  open: boolean;
  onClose: () => void;
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  shortlisted: string;
  onShortlistedChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
  matchMin: number;
  onMatchMinChange: (v: number) => void;
  hasSubmission: string;
  onHasSubmissionChange: (v: string) => void;
  selectedProfession: string;
  onSelectedProfessionChange: (v: string) => void;
  applications: EnrichedApplication[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ApplicantFiltersSidebar({
  open,
  onClose,
  search,
  onSearchChange,
  status,
  onStatusChange,
  shortlisted,
  onShortlistedChange,
  sort,
  onSortChange,
  matchMin,
  onMatchMinChange,
  hasSubmission,
  onHasSubmissionChange,
  selectedProfession,
  onSelectedProfessionChange,
  applications,
  hasActiveFilters,
  onClearFilters,
}: ApplicantFiltersSidebarProps) {
  const professions = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((app) => {
      const talent =
        typeof app.talent_id === "object" && app.talent_id !== null
          ? app.talent_id
          : null;
      const profs = app.talent_profile?.professions || [];
      profs.forEach((p) => set.add(p));
    });
    return Array.from(set).sort();
  }, [applications]);

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
        <span className="text-sm font-semibold text-ink flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
          Filters
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted-bg transition-colors"
        >
          <X className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted pointer-events-none"
                strokeWidth={1.5}
              />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                type="search"
                placeholder="Search by name..."
                className="h-9 rounded-xl border-border/60 bg-muted-bg/50 pl-9 pr-8 text-sm focus-visible:ring-gold/30"
              />
              {search && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-muted hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Status tabs */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Status
              </label>
              <div className="flex flex-wrap gap-1">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => onStatusChange(tab.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      status === tab.value
                        ? "bg-ink text-white shadow-sm"
                        : "bg-muted-bg text-text-secondary hover:text-ink hover:bg-muted-bg/80",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shortlisted toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Shortlisted
              </label>
              <button
                onClick={() => onShortlistedChange(shortlisted === "true" ? "all" : "true")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                  shortlisted === "true"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-border/60 bg-muted-bg/50 text-text-secondary hover:text-ink",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Show only shortlisted
                </span>
                <span
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                    shortlisted === "true"
                      ? "border-amber-400 bg-amber-400"
                      : "border-border",
                  )}
                >
                  {shortlisted === "true" && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6l3 3 5-6" />
                    </svg>
                  )}
                </span>
              </button>
            </div>

            {/* Match score slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  Min Match Score
                </label>
                <span className="text-xs font-bold text-brand">{matchMin}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={matchMin}
                onChange={(e) => onMatchMinChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-muted-bg cursor-pointer accent-brand"
              />
              <div className="flex justify-between text-[10px] text-ink-muted/60">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Has submission toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Task Submission
              </label>
              <button
                onClick={() => onHasSubmissionChange(hasSubmission === "true" ? "all" : "true")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                  hasSubmission === "true"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-border/60 bg-muted-bg/50 text-text-secondary hover:text-ink",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Has submitted task
                </span>
                <span
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                    hasSubmission === "true"
                      ? "border-blue-400 bg-blue-400"
                      : "border-border",
                  )}
                >
                  {hasSubmission === "true" && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6l3 3 5-6" />
                    </svg>
                  )}
                </span>
              </button>
            </div>

            {/* Profession filter */}
            {professions.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  Profession
                </label>
                <Select
                  value={selectedProfession || "all"}
                  onValueChange={(v) => onSelectedProfessionChange(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="h-9 rounded-xl border-border/60 bg-muted-bg/50 text-xs">
                    <SelectValue placeholder="All professions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All professions</SelectItem>
                    {professions.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Sort */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Sort
              </label>
              <Select value={sort} onValueChange={onSortChange}>
                <SelectTrigger className="h-9 rounded-xl border-border/60 bg-muted-bg/50 text-xs">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="w-full h-9 rounded-xl text-xs font-medium text-ink-muted hover:text-ink hover:bg-cream-deep/60"
              >
                <X className="h-3 w-3 mr-1" strokeWidth={2} />
                Clear all filters
              </Button>
            )}
          </div>
        </ScrollArea>
    </div>
  );
}
