"use client";

import { useEffect, useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PortfolioUploader } from "@/components/portfolio/portfolio-uploader";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

export default function TalentPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [mediaLimits, setMediaLimits] = useState<{
    images_used: number;
    videos_used: number;
    plan_max_images: number;
    plan_max_videos: number;
  }>({
    images_used: 0,
    videos_used: 0,
    plan_max_images: 5,
    plan_max_videos: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      setError(null);
      const [portfolioRes, profileRes] = await Promise.all([
        talentApi.getPortfolio(),
        talentApi.getMyProfile(),
      ]);
      setItems(portfolioRes.items || []);
      if (profileRes?.media_limits) {
        setMediaLimits(profileRes.media_limits);
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
    async (id: string, dto: { caption?: string; category?: "work" | "personal" | "intro"; is_pinned?: boolean }) => {
      try {
        const { item } = await talentApi.updatePortfolioItem(id, dto);
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  caption: item.caption,
                  category: item.category,
                  is_pinned: item.is_pinned,
                }
              : i
          )
        );

        // If pinning intro, unpin other intros locally
        if (dto.is_pinned && dto.category === "intro") {
          setItems((prev) =>
            prev.map((i) =>
              i.id !== id && i.category === "intro" ? { ...i, is_pinned: false } : i
            )
          );
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to update item"));
      }
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await talentApi.deletePortfolioItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      // Refresh limits from profile after delete
      const profile = await talentApi.getMyProfile();
      if (profile?.media_limits) {
        setMediaLimits(profile.media_limits);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete item"));
    }
  }, []);

  const handleReorder = useCallback(async (itemIds: string[]) => {
    // Optimistic update
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
      // Revert on error
      fetchPortfolio();
    }
  }, [items, fetchPortfolio]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Portfolio</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PortfolioUploader
        imagesUsed={mediaLimits.images_used}
        videosUsed={mediaLimits.videos_used}
        maxImages={mediaLimits.plan_max_images}
        maxVideos={mediaLimits.plan_max_videos}
        onUpload={fetchPortfolio}
      />

      <PortfolioGrid
        items={items}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </div>
  );
}
