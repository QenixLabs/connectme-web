"use client";

import { useState, useCallback } from "react";
import { Upload, Video, Crown, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useMyPortfolio,
  useUpdatePortfolioItem,
  useDeletePortfolioItem,
} from "@/hooks/use-portfolio";
import { useMyProfile } from "@/hooks/use-talent-profile";
import type { PortfolioApiResponse } from "@/lib/api/talent";

import { mapApiToItem } from "./portfolio/types";
import { PortfolioHeader } from "./portfolio/portfolio-header";
import { PortfolioStats } from "./portfolio/portfolio-stats";
import { PortfolioUsageBar } from "./portfolio/portfolio-usage-bar";
import { PortfolioFeatured } from "./portfolio/portfolio-featured";
import { PortfolioGrid } from "./portfolio/portfolio-grid";
import { PortfolioSelectionBar } from "./portfolio/portfolio-selection-bar";
import { PortfolioLightbox } from "./portfolio/portfolio-lightbox";
import { UploadDialog } from "./portfolio/dialogs/upload-dialog";
import { AddVideoDialog } from "./portfolio/dialogs/add-video-dialog";
import { EditItemDialog } from "./portfolio/dialogs/edit-item-dialog";
import { DeleteConfirmDialog } from "./portfolio/dialogs/delete-confirm";

// ── Loading Skeleton ───────────────────────────────────────

function PortfolioSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 pb-28 pt-5 lg:px-6">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export function PortfolioPage() {
  const [showBanner, setShowBanner] = useState(true);

  // Dialog states
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null);
  const [addVideoOpen, setAddVideoOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioApiResponse | null>(null);
  const [deletingItem, setDeletingItem] = useState<PortfolioApiResponse | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<ReturnType<typeof mapApiToItem>[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Queries
  const portfolioQuery = useMyPortfolio();
  const profileQuery = useMyProfile();

  // Mutations
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();

  const rawItems = portfolioQuery.data ?? [];
  const items = rawItems.map(mapApiToItem);
  const ml = profileQuery.data?.media_limits;
  const imagesUsed = ml?.images_used ?? 0;
  const planMaxImages = ml?.plan_max_images ?? 5;
  const videosUsed = ml?.videos_used ?? 0;
  const planMaxVideos = ml?.plan_max_videos ?? 1;
  const linksCount = items.filter((i) => i.kind === "link").length;
  const totalViews = items.reduce((sum, i) => sum + i.views, 0);
  const pinnedCount = items.filter((i) => i.pinned).length;

  const pinnedItem = items.find((i) => i.pinned);
  const unpinnedItems = items.filter((i) => !i.pinned);

  const selectedItems = items.filter((i) => selectedIds.has(i.id));

  // ── Handlers ───────────────────────────────────────────

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleTogglePin = useCallback(
    async (item: ReturnType<typeof mapApiToItem>) => {
      try {
        if (!item.pinned) {
          const currentlyPinned = items.find((i) => i.pinned && i.id !== item.id);
          if (currentlyPinned) {
            await updateItem.mutateAsync({
              itemId: currentlyPinned.id,
              data: { is_pinned: false },
            });
          }
        }
        await updateItem.mutateAsync({
          itemId: item.id,
          data: { is_pinned: !item.pinned },
        });
        toast.success(item.pinned ? "Unpinned" : "Pinned");
      } catch {
        toast.error("Failed to update pin");
      }
    },
    [updateItem, items],
  );

  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    try {
      await deleteItem.mutateAsync(deletingItem.id);
      toast.success("Deleted");
      setDeletingItem(null);
    } catch {
      toast.error("Failed to delete");
    }
  }, [deletingItem, deleteItem]);

  const handleBulkDelete = useCallback(async () => {
    setBulkDeleting(true);
    try {
      await Promise.all(
        selectedItems.map((item) => deleteItem.mutateAsync(item.id)),
      );
      toast.success(`${selectedItems.length} items deleted`);
      clearSelection();
    } catch {
      toast.error("Failed to delete some items");
    } finally {
      setBulkDeleting(false);
    }
  }, [selectedItems, deleteItem, clearSelection]);

  const handleBulkPin = useCallback(async () => {
    const toPin = selectedItems.filter((i) => !i.pinned);
    if (toPin.length === 0) {
      toast.info("Selected items already pinned");
      return;
    }
    if (toPin.length > 1) {
      toast.error("Only 1 item can be pinned");
      return;
    }
    try {
      await updateItem.mutateAsync({
        itemId: toPin[0].id,
        data: { is_pinned: true },
      });
      toast.success("Item pinned");
      clearSelection();
    } catch {
      toast.error("Failed to pin item");
    }
  }, [selectedItems, updateItem, clearSelection]);

  const openLightbox = useCallback(
    (itemId: string) => {
      const ordered = [...items];
      setLightboxItems(ordered);
      setLightboxIndex(Math.max(0, ordered.findIndex((i) => i.id === itemId)));
      setLightboxOpen(true);
    },
    [items],
  );

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  if (portfolioQuery.isLoading) {
    return <PortfolioSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="space-y-5 px-4 pb-40 pt-5 lg:px-6">
        {/* Header */}
        <PortfolioHeader
          pinnedCount={pinnedCount}
          onUpload={() => setUploadType("image")}
        />

        {/* Stats */}
        <PortfolioStats
          totalItems={items.length}
          imagesUsed={imagesUsed}
          videosUsed={videosUsed}
          linksCount={linksCount}
          totalViews={totalViews}
        />

        {/* Usage */}
        <PortfolioUsageBar
          imagesUsed={imagesUsed}
          planMaxImages={planMaxImages}
          videosUsed={videosUsed}
          planMaxVideos={planMaxVideos}
        />

        {/* Upgrade banner */}
        {showBanner && (imagesUsed / planMaxImages > 0.7 || videosUsed >= planMaxVideos) && (
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-gold/40 bg-gold/[0.06] px-4 py-3">
            <Crown className="h-5 w-5 shrink-0 text-gold" />
            <p className="min-w-0 text-sm">
              <span className="font-semibold text-gold">Upgrade to Pro</span>{" "}
              <span className="text-muted-foreground">
                for more uploads, advanced analytics, custom branding and priority
                support.
              </span>
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <button className="hidden items-center gap-1 text-sm font-medium text-teal sm:flex">
                Learn more
              </button>
              <button
                onClick={() => setShowBanner(false)}
                aria-label="Dismiss"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile upload buttons */}
        <div className="flex gap-3 lg:hidden">
          <Button onClick={() => setUploadType("image")} className="flex-1">
            <Upload className="mr-2 h-4 w-4" /> Upload Image
          </Button>
          <Button onClick={() => setAddVideoOpen(true)} variant="outline" className="flex-1">
            <Video className="mr-2 h-4 w-4" /> Add Video
          </Button>
        </div>

        {/* Featured pinned item */}
        {pinnedItem && (
          <PortfolioFeatured
            item={pinnedItem}
            onOpen={() => openLightbox(pinnedItem.id)}
            onEdit={() => setEditingItem(rawItems.find((r) => r.id === pinnedItem.id) ?? null)}
            onDelete={() => setDeletingItem(rawItems.find((r) => r.id === pinnedItem.id) ?? null)}
            onTogglePin={() => handleTogglePin(pinnedItem)}
          />
        )}

        {/* Grid with tabs */}
        <PortfolioGrid
          items={unpinnedItems}
          onEdit={(item) =>
            setEditingItem(rawItems.find((r) => r.id === item.id) ?? null)
          }
          onDelete={(item) =>
            setDeletingItem(rawItems.find((r) => r.id === item.id) ?? null)
          }
          onTogglePin={handleTogglePin}
          onOpen={openLightbox}
          onToggleSelect={toggleSelect}
          onUploadImage={() => setUploadType("image")}
          onUploadVideo={() => setAddVideoOpen(true)}
        />
      </div>

      {/* Selection bar */}
      {selectedIds.size > 0 && (
        <PortfolioSelectionBar
          count={selectedIds.size}
          onPin={handleBulkPin}
          onDelete={handleBulkDelete}
          onClear={clearSelection}
          isPending={bulkDeleting}
        />
      )}

      {/* Lightbox */}
      <PortfolioLightbox
        key={lightboxOpen ? `open-${lightboxIndex}` : `closed-${lightboxIndex}`}
        items={lightboxItems}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={closeLightbox}
      />

      {/* Dialogs */}
      <UploadDialog
        open={uploadType !== null}
        onOpenChange={(o) => { if (!o) setUploadType(null); }}
        type={uploadType ?? "image"}
      />
      <AddVideoDialog open={addVideoOpen} onOpenChange={setAddVideoOpen} />
      <EditItemDialog
        open={editingItem !== null}
        onOpenChange={(o) => { if (!o) setEditingItem(null); }}
        item={editingItem}
      />
      <DeleteConfirmDialog
        open={deletingItem !== null}
        onOpenChange={(o) => { if (!o) setDeletingItem(null); }}
        onConfirm={handleDelete}
        title={deletingItem?.title ?? ""}
        isPending={deleteItem.isPending}
      />
    </div>
  );
}
