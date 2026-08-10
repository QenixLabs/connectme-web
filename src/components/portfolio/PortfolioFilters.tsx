"use client";

import { ChevronDown, ChevronUp, List, LayoutGrid, SlidersHorizontal } from "lucide-react";

const filters = [
  { label: "Media Type", value: "All" },
  { label: "Category", value: "All" },
  { label: "Project", value: "All" },
  { label: "Year", value: "All" },
];

export type TabLabel = "All" | "Images" | "Videos";

export type ViewMode = "grid" | "list";

export function createTabs(imageCount: number, videoCount: number) {
  const all = imageCount + videoCount;
  return [
    { label: "All" as TabLabel, count: all, display: `All (${all})` },
    { label: "Images" as TabLabel, count: imageCount, display: `Images (${imageCount})` },
    { label: "Videos" as TabLabel, count: videoCount, display: `Videos (${videoCount})` },
  ];
}

export function PortfolioFilters({
  activeTab,
  onTabChange,
  filtersOpen,
  onToggleFilters,
  view,
  onViewChange,
  imageCount,
  videoCount,
}: {
  activeTab: TabLabel;
  onTabChange: (tab: TabLabel) => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  imageCount: number;
  videoCount: number;
}) {
  const tabs = createTabs(imageCount, videoCount);
  return (
    <>
      <div className="-mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => onTabChange(tab.label)}
            className={`shrink-0 rounded-lg border px-4 py-2 text-sm transition-colors ${
              tab.label === activeTab
                ? "border-primary/70 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {tab.display}
          </button>
        ))}
      </div>

      <section className="mt-4 rounded-2xl border border-border bg-surface p-3 sm:p-4 lg:mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden flex-wrap gap-3 lg:flex">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => onTabChange(tab.label)}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  tab.label === activeTab
                    ? "border-primary/70 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.display}
              </button>
            ))}
          </div>

          <button
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-foreground transition-colors lg:ml-auto lg:w-auto lg:border lg:border-border lg:bg-card lg:hover:bg-secondary"
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {filtersOpen ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {filtersOpen ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto] xl:items-center">
            {filters.map((f) => (
              <button
                key={f.label}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-left"
              >
                <span>
                  <span className="block text-sm text-foreground">{f.label}</span>
                  <span className="block text-xs text-muted-foreground">{f.value}</span>
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
            ))}
            <button className="px-2 py-1 text-sm text-primary hover:underline xl:justify-self-end">
              Clear all
            </button>
          </div>
        ) : null}
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 lg:mt-6 lg:justify-end">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Sort by:
          <button className="inline-flex items-center gap-1 font-medium text-foreground">
            Newest
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <button
            onClick={() => onViewChange("grid")}
            aria-label="Grid view"
            className={`grid size-9 place-items-center rounded-lg ${
              view === "grid" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => onViewChange("list")}
            aria-label="List view"
            className={`grid size-9 place-items-center rounded-lg ${
              view === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}
