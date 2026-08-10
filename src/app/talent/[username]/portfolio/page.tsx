"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Upload,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PortfolioFilters, type ViewMode, type TabLabel } from "@/components/portfolio/PortfolioFilters";
import { PremiumBanner } from "@/components/portfolio/PremiumBanner";
import { PortfolioViewer } from "@/components/portfolio/PortfolioViewer";
import { useTalentPortfolio } from "@/hooks/use-talent-profile";
import type { PortfolioApiResponse } from "@/lib/api/talent";

function mapApiItem(item: PortfolioApiResponse, index: number, total: number) {
  return {
    title: item.title || item.caption || `Item ${index + 1}`,
    description: item.description || "",
    type: (item.type === "video" ? "video" : "image") as "image" | "video",
    src: item.thumbnail_url || item.url,
    index: index + 1,
    total,
  };
}

function PortfolioSkeleton() {
  return (
    <div className="bg-background">
      <main className="mx-auto min-w-0 max-w-7xl px-4 pb-28 pt-6 md:px-8 md:py-8 lg:pb-8">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="mt-2 h-5 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function PortfolioPage() {
  const params = useParams();
  const username = (params?.username as string) || "";
  const { data: apiItems = [], isLoading } = useTalentPortfolio(username);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabLabel>("All");
  const [view, setView] = useState<ViewMode>("grid");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const { imageCount, videoCount, filtered } = useMemo(() => {
    const total = apiItems.length;
    const images = apiItems.filter((i) => i.type !== "video");
    const videos = apiItems.filter((i) => i.type === "video");

    const filteredApi =
      activeTab === "Images"
        ? images
        : activeTab === "Videos"
          ? videos
          : apiItems;

    const filtered = filteredApi.map((item, idx) =>
      mapApiItem(item, idx, total),
    );

    return { imageCount: images.length, videoCount: videos.length, filtered };
  }, [activeTab, apiItems]);

  if (isLoading) {
    return <PortfolioSkeleton />;
  }

  return (
    <div className="bg-background">
      <main className="mx-auto min-w-0 max-w-7xl px-4 pb-28 pt-6 md:px-8 md:py-8 lg:pb-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Portfolio
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore the talent&apos;s complete body of work.
            </p>
          </div>
          <button className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-primary/60 bg-card px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10">
            <Upload className="size-4" />
            <span className="sm:hidden">Export</span>
            <span className="hidden sm:inline">Export Portfolio</span>
          </button>
        </div>

        <PortfolioFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((o) => !o)}
          view={view}
          onViewChange={setView}
          imageCount={imageCount}
          videoCount={videoCount}
        />

        <section
          className={`mt-5 gap-4 sm:gap-5 ${
            view === "grid"
              ? "grid sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col"
          }`}
        >
          {filtered.map((item, idx) => (
            <PortfolioCard
              key={`${item.title}-${idx}`}
              item={item}
              onClick={() => {
                setViewerIndex(idx);
                setViewerOpen(true);
              }}
            />
          ))}
        </section>

        {filtered.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">No portfolio items found.</p>
          </div>
        )}

        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            aria-label="Previous page"
            className="grid size-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`size-10 rounded-lg border text-sm ${
                page === 1
                  ? "border-primary/70 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            aria-label="Next page"
            className="grid size-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>

        <section className="mt-8 grid gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-6 lg:flex lg:flex-wrap lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              Need help viewing portfolio?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Some media files may require specific software or plugins to view.
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/60 bg-card px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10">
            <HelpCircle className="size-4" />
            View Support Guide
          </button>
        </section>

        <PremiumBanner />
      </main>

      <PortfolioViewer
        items={filtered}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
