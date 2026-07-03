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
    async (
      id: string,
      dto: {
        caption?: string;
        category?: "work" | "personal" | "intro";
        is_pinned?: boolean;
      }
    ) => {
      try {
        const { item } = await talentApi.updatePortfolioItem(id, dto);
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, caption: item.caption, category: item.category, is_pinned: item.is_pinned }
              : i
          )
        );
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
      const profile = await talentApi.getMyProfile();
      if (profile?.media_limits) {
        setMediaLimits(profile.media_limits);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete item"));
    }
  }, []);

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

  const imagesPct = Math.round((mediaLimits.images_used / mediaLimits.plan_max_images) * 100);
  const videosPct = Math.round((mediaLimits.videos_used / mediaLimits.plan_max_videos) * 100);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4">
        {/* Header skeleton */}
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div className="h-10 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>

        {/* Quota skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Upload skeleton */}
        <div className="h-36 bg-muted rounded-xl animate-pulse" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-3xl mx-auto py-4 space-y-6"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Page header ── */}
      <div className="flex items-end justify-between border-b border-border pb-4">
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: "-0.5px",
            margin: 0,
          }}
        >
          My{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--muted-foreground)",
            }}
          >
            Portfolio
          </em>
        </h1>
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}
        >
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Error alert ── */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Quota cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Images quota */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              margin: 0,
            }}
          >
            Images
          </p>
          <div
            className="rounded-full overflow-hidden"
            style={{ height: 4, background: "var(--border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${imagesPct}%`,
                background: imagesPct >= 80 ? "#BA7517" : "var(--foreground)",
              }}
            />
          </div>
          <p style={{ fontSize: "13px", color: "var(--muted-foreground)", margin: 0 }}>
            <strong style={{ color: "var(--foreground)", fontWeight: 500 }}>
              {mediaLimits.images_used}
            </strong>{" "}
            / {mediaLimits.plan_max_images} used
          </p>
        </div>

        {/* Videos quota */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              margin: 0,
            }}
          >
            Videos
          </p>
          <div
            className="rounded-full overflow-hidden"
            style={{ height: 4, background: "var(--border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${videosPct}%`,
                background: videosPct >= 80 ? "#BA7517" : "var(--foreground)",
              }}
            />
          </div>
          <p style={{ fontSize: "13px", color: "var(--muted-foreground)", margin: 0 }}>
            <strong style={{ color: "var(--foreground)", fontWeight: 500 }}>
              {mediaLimits.videos_used}
            </strong>{" "}
            / {mediaLimits.plan_max_videos} used
          </p>
        </div>

        {/* Upgrade nudge */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 flex flex-col justify-between gap-2">
          <p style={{ fontSize: "13px", color: "var(--muted-foreground)", margin: 0 }}>
            Unlock{" "}
            <strong style={{ color: "var(--foreground)", fontWeight: 500 }}>20 images</strong>{" "}
            &amp;{" "}
            <strong style={{ color: "var(--foreground)", fontWeight: 500 }}>5 videos</strong>
          </p>
          <button
            className="self-start text-xs border border-border rounded-lg px-3 py-1 bg-transparent hover:bg-muted transition-colors"
            style={{
              fontFamily: "inherit",
              letterSpacing: "0.03em",
              cursor: "pointer",
            }}
          >
            Upgrade plan →
          </button>
        </div>
      </div>

      {/* ── Upload zone ── */}
      <PortfolioUploader
        imagesUsed={mediaLimits.images_used}
        videosUsed={mediaLimits.videos_used}
        maxImages={mediaLimits.plan_max_images}
        maxVideos={mediaLimits.plan_max_videos}
        onUpload={fetchPortfolio}
      />

      {/* ── Section label ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--muted-foreground)",
        }}
      >
        <span>Portfolio items</span>
        <span
          style={{ flex: 1, height: "0.5px", background: "var(--border)", display: "block" }}
        />
      </div>

      {/* ── Portfolio grid ── */}
      <PortfolioGrid
        items={items}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </div>
  );
}