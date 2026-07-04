"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { PortfolioUploader } from "@/components/portfolio/portfolio-uploader";
import { PortfolioStats } from "@/components/portfolio/portfolio-stats";
import { PortfolioCategoryFilter } from "@/components/portfolio/portfolio-category-filter";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { PortfolioItemDetailSheet } from "@/components/portfolio/portfolio-item-detail-sheet";
import { PortfolioLightbox } from "@/components/portfolio/portfolio-lightbox";
import { PortfolioSection } from "@/components/public-profile/portfolio-section";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, Pin, Eye, PenLine } from "lucide-react";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

type CategoryFilter = "all" | "work" | "personal" | "intro";

export default function TalentPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [mediaLimits, setMediaLimits] = useState({
    images_used: 0,
    videos_used: 0,
    plan_max_images: 5,
    plan_max_videos: 1,
  });
  const [stats, setStats] = useState<{
    total_items: number;
    items_by_type: { images: number; videos: number };
    items_by_category: Record<string, number>;
    total_views: number;
    profile_views_7d: number;
    profile_views_30d: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fetchPortfolio = useCallback(async () => {
    try {
      setError(null);
      const [portfolioRes, profileRes, statsRes] = await Promise.all([
        talentApi.getPortfolio(),
        talentApi.getMyProfile(),
        talentApi.getPortfolioStats().catch(() => null),
      ]);
      setItems(portfolioRes.items || []);
      if (profileRes?.media_limits) {
        setMediaLimits(profileRes.media_limits);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load portfolio"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleUpdate = useCallback(
    async (
      id: string,
      dto: {
        caption?: string;
        title?: string;
        description?: string;
        category?: "work" | "personal" | "intro";
        is_pinned?: boolean;
      }
    ) => {
      try {
        const { item } = await talentApi.updatePortfolioItem(id, dto);
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, caption: item.caption, title: item.title, description: item.description, category: item.category, is_pinned: item.is_pinned }
              : i
          )
        );
        if (selectedItem?.id === id) {
          setSelectedItem((prev) =>
            prev
              ? { ...prev, caption: item.caption, title: item.title, description: item.description, category: item.category, is_pinned: item.is_pinned }
              : null
          );
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to update item"));
      }
    },
    [selectedItem]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await talentApi.deletePortfolioItem(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        const profile = await talentApi.getMyProfile();
        if (profile?.media_limits) {
          setMediaLimits(profile.media_limits);
        }
        setStats((prev) =>
          prev ? { ...prev, total_items: prev.total_items - 1 } : null
        );
        if (selectedItem?.id === id) {
          setSelectedItem(null);
          setDetailSheetOpen(false);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to delete item"));
      }
    },
    [selectedItem]
  );

  const handleReorder = useCallback(
    async (itemIds: string[]) => {
      const itemMap = new Map(items.map((i) => [i.id, i]));
      const reordered = itemIds
        .map((id) => itemMap.get(id))
        .filter(Boolean) as PortfolioItem[];
      const remaining = items.filter((i) => !itemIds.includes(i.id));
      setItems([...reordered, ...remaining]);

      try {
        const { items: serverItems } = await talentApi.reorderPortfolioItems(itemIds);
        setItems(serverItems);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to reorder items"));
        fetchPortfolio();
      }
    },
    [items, fetchPortfolio]
  );

  const handleSelectItem = useCallback((item: PortfolioItem) => {
    setSelectedItem(item);
    setDetailSheetOpen(true);
  }, []);

  const handlePreview = useCallback((item: PortfolioItem) => {
    setLightboxItem(item);
    setLightboxOpen(true);
  }, []);

  const filteredItems = useMemo(
    () =>
      categoryFilter === "all"
        ? items
        : items.filter((i) => i.category === categoryFilter),
    [items, categoryFilter]
  );

  const pinnedCount = useMemo(() => items.filter((i) => i.is_pinned).length, [items]);

  const categoryCounts = useMemo(
    () => ({
      work: items.filter((i) => i.category === "work").length,
      personal: items.filter((i) => i.category === "personal").length,
      intro: items.filter((i) => i.category === "intro").length,
    }),
    [items]
  );

  const imagesPct = Math.round(
    (mediaLimits.images_used / mediaLimits.plan_max_images) * 100
  );
  const videosPct = Math.round(
    (mediaLimits.videos_used / mediaLimits.plan_max_videos) * 100
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 py-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="flex gap-2.5 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 w-28 bg-muted rounded-xl animate-pulse flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 bg-muted rounded-2xl animate-pulse" />
          <div className="h-28 bg-muted rounded-2xl animate-pulse" />
        </div>
        <div className="h-36 bg-muted rounded-2xl animate-pulse" />
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 w-16 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className="max-w-3xl mx-auto py-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight">
              Public Preview
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              This is how recruiters see your portfolio
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-xs font-medium hover:bg-text-primary transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <PortfolioSection
          items={items}
          onItemClick={(item) => {
            setLightboxItem(item);
            setLightboxOpen(true);
          }}
        />

        <PortfolioLightbox
          item={lightboxItem}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">
            My Portfolio
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Showcase your best work to recruiters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[11px] font-medium text-text-secondary hover:bg-muted transition-colors"
          >
            <Eye className="h-3 w-3" />
            Preview
          </button>
          <span className="text-[11px] font-medium text-brand bg-brand/10 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Pin className="h-3 w-3" />
            {pinnedCount}/3
          </span>
          <span className="text-[11px] font-medium text-text-muted bg-muted px-2.5 py-1 rounded-full">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats bar */}
      {stats && (
        <PortfolioStats
          totalItems={stats.total_items}
          imagesCount={stats.items_by_type.images}
          videosCount={stats.items_by_type.videos}
          totalViews={stats.total_views}
          profileViews7d={stats.profile_views_7d}
        />
      )}

      {/* Quota + Upgrade row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Images quota */}
        <Card className="rounded-2xl border-border p-4 gap-3">
          <CardContent className="p-0 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
              Images
            </p>
            <span className="text-sm font-semibold tabular-nums text-text-primary">
              {mediaLimits.images_used}/{mediaLimits.plan_max_images}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                imagesPct >= 80 ? "bg-amber" : "bg-foreground"
              )}
              style={{ width: `${imagesPct}%` }}
            />
           </div>
          </CardContent>
        </Card>

        {/* Videos quota */}
        <Card className="rounded-2xl border-border p-4 gap-3">
          <CardContent className="p-0 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
              Videos
            </p>
            <span className="text-sm font-semibold tabular-nums text-text-primary">
              {mediaLimits.videos_used}/{mediaLimits.plan_max_videos}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                videosPct >= 80 ? "bg-amber" : "bg-foreground"
              )}
              style={{ width: `${videosPct}%` }}
            />
          </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade nudge */}
      <Card className="rounded-2xl border-border p-0 gap-0 bg-gradient-to-br from-cream to-cream-soft">
        <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand/10">
            <TrendingUp className="w-5 h-5 text-brand" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">
              Unlock <span className="font-semibold">20 images</span> &{" "}
              <span className="font-semibold">5 videos</span>
            </p>
            <p className="text-xs text-text-muted truncate">
              Upgrade your plan for more portfolio space
            </p>
          </div>
        </div>
        <button className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-xs font-medium hover:bg-text-primary transition-colors">
          <Sparkles className="w-3 h-3" strokeWidth={1.5} />
          Upgrade
        </button>
        </CardContent>
      </Card>

      {/* Upload zone */}
      <PortfolioUploader
        imagesUsed={mediaLimits.images_used}
        videosUsed={mediaLimits.videos_used}
        maxImages={mediaLimits.plan_max_images}
        maxVideos={mediaLimits.plan_max_videos}
        onUpload={fetchPortfolio}
      />

      {/* Category filter */}
      {items.length > 0 && (
        <PortfolioCategoryFilter
          active={categoryFilter}
          onChange={setCategoryFilter}
          counts={categoryCounts}
        />
      )}

      {/* Portfolio grid */}
      <PortfolioGrid
        items={filteredItems}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onReorder={handleReorder}
        onSelectItem={handleSelectItem}
        onPreview={handlePreview}
      />

      {/* Item detail sheet */}
      <PortfolioItemDetailSheet
        item={selectedItem}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <PortfolioLightbox
        item={lightboxItem}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}
