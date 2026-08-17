"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useStore } from "zustand/react";
import { authStore } from "@/stores/auth-store";
import { toast } from "sonner";
import {
  usePublicPortfolio,
  useUploadPortfolioImage,
  useUploadPortfolioVideo,
  useUploadPortfolioYouTube,
  useUpdatePortfolioItem,
  useDeletePortfolioItem,
  useTogglePortfolioFeatured,
  useReorderPortfolio,
  filterPortfolioItems,
} from "@/hooks/use-portfolio";
import type {
  PortfolioItem,
  PortfolioItemType,
  PortfolioTab,
} from "@/lib/types/portfolio";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";
import { PortfolioTabs } from "@/components/portfolio/PortfolioTabs";
import { FeaturedPortfolio } from "@/components/portfolio/FeaturedPortfolio";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { PortfolioReelOverlay } from "@/components/portfolio/PortfolioReelOverlay";
import { AddPortfolioModal } from "@/components/portfolio/AddPortfolioModal";
import { EditPortfolioModal } from "@/components/portfolio/EditPortfolioModal";
import { ReorderSheet } from "@/components/portfolio/ReorderSheet";
import { ShareSheet } from "@/components/portfolio/ShareSheet";
import { EmptyPortfolioState } from "@/components/portfolio/EmptyPortfolioState";
import { PortfolioSkeleton } from "@/components/portfolio/PortfolioSkeleton";

export default function PortfolioPage() {
  const params = useParams();
  const username = (params?.username as string) || "";
  const user = useStore(authStore, (s) => s.user);
  const isOwner =
    !!user?.username &&
    user.username.toLowerCase() === username.toLowerCase();

  const { data: items = [], isLoading, error } = usePublicPortfolio(username);

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
      ),
    [items],
  );

  const [activeTab, setActiveTab] = useState<PortfolioTab>("All");

  const searchParams = useSearchParams();
  const initialItemIdFromUrl = searchParams.get("item");
  const [reelOpen, setReelOpen] = useState(() => !!initialItemIdFromUrl);
  const [reelInitialItemId, setReelInitialItemId] = useState<string | null>(
    () => initialItemIdFromUrl,
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [shareItem, setShareItem] = useState<PortfolioItem | null>(null);

  const uploadImage = useUploadPortfolioImage();
  const uploadVideo = useUploadPortfolioVideo();
  const uploadYouTube = useUploadPortfolioYouTube();
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();
  const toggleFeatured = useTogglePortfolioFeatured();
  const reorder = useReorderPortfolio();

  const isSubmitting =
    uploadImage.isPending ||
    uploadVideo.isPending ||
    uploadYouTube.isPending ||
    updateItem.isPending ||
    deleteItem.isPending ||
    toggleFeatured.isPending ||
    reorder.isPending;

  const counts = useMemo(
    () => ({
      All: items.length,
      Images: items.filter((i) => i.type === "image").length,
      Videos: items.filter((i) => i.type === "video").length,
      YouTube: items.filter((i) => i.type === "youtube").length,
    }),
    [items],
  );

  const featuredItem = useMemo(
    () => sortedItems.find((i) => i.isFeatured) || null,
    [sortedItems],
  );

  const filteredItems = useMemo(() => {
    const withoutFeatured = featuredItem
      ? sortedItems.filter((i) => i.id !== featuredItem.id)
      : sortedItems;
    return filterPortfolioItems(withoutFeatured, activeTab);
  }, [sortedItems, featuredItem, activeTab]);

  const handleTabChange = useCallback((tab: PortfolioTab) => {
    setActiveTab(tab);
  }, []);

  const handleItemClick = useCallback((item: PortfolioItem) => {
    setReelInitialItemId(item.id);
    setReelOpen(true);
  }, []);

  const handleCloseReel = useCallback(() => {
    setReelOpen(false);
    setReelInitialItemId(null);
  }, []);

  const handleAddWork = useCallback(
    async (data: {
      type: PortfolioItemType;
      title: string;
      description?: string;
      file?: File;
      thumbnail?: File;
      url?: string;
      isFeatured: boolean;
    }) => {
      const basePayload = {
        title: data.title,
        caption: data.title,
        description: data.description,
        is_pinned: data.isFeatured,
        category: "work" as const,
      };

      try {
        if (data.type === "image" && data.file) {
          await uploadImage.mutateAsync({ file: data.file, data: basePayload });
        } else if (data.type === "video" && data.file) {
          await uploadVideo.mutateAsync({
            file: data.file,
            thumbnail: data.thumbnail,
            data: basePayload,
          });
        } else if (data.type === "youtube" && data.url) {
          await uploadYouTube.mutateAsync({
            url: data.url,
            data: basePayload,
          });
        }
        toast.success("Work published successfully");
        setAddOpen(false);
      } catch {
        toast.error("Failed to publish work. Please try again.");
      }
    },
    [uploadImage, uploadVideo, uploadYouTube],
  );

  const handleEdit = useCallback(
    async (
      itemId: string,
      data: {
        title: string;
        description?: string;
        isFeatured: boolean;
        visibility: PortfolioItem["visibility"];
        skills: string[];
      },
    ) => {
      try {
        await updateItem.mutateAsync({
          itemId,
          data: {
            title: data.title,
            caption: data.title,
            description: data.description,
            is_pinned: data.isFeatured,
            category: "work",
          },
        });
        toast.success("Changes saved");
        setEditItem(null);
      } catch {
        toast.error("Failed to save changes");
      }
    },
    [updateItem],
  );

  const handleToggleFeatured = useCallback(
    async (item: PortfolioItem) => {
      try {
        await toggleFeatured.mutateAsync({
          itemId: item.id,
          isPinned: !item.isFeatured,
        });
        toast.success(
          item.isFeatured ? "Removed from featured" : "Set as featured",
        );
      } catch {
        toast.error("Failed to update featured status");
      }
    },
    [toggleFeatured],
  );

  const handleDelete = useCallback(
    async (item: PortfolioItem) => {
      if (!confirm("Delete this work? This cannot be undone.")) return;
      try {
        await deleteItem.mutateAsync(item.id);
        toast.success("Work deleted");
      } catch {
        toast.error("Failed to delete work");
      }
    },
    [deleteItem],
  );

  const handleReorder = useCallback(
    async (orderedIds: string[]) => {
      try {
        await reorder.mutateAsync(orderedIds);
        toast.success("Order saved");
        setReorderOpen(false);
      } catch {
        toast.error("Failed to save order");
      }
    },
    [reorder],
  );

  const handleShare = useCallback((item: PortfolioItem) => {
    setShareItem(item);
  }, []);

  if (isLoading) {
    return <PortfolioSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container-page py-12 text-center">
          <p className="text-destructive">Failed to load portfolio.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container-page pb-28 pt-6 md:py-8 lg:pb-8">
        <PortfolioHeader
          username={username}
          isOwner={isOwner}
          onAddWork={() => setAddOpen(true)}
        />

        <div className="mt-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Portfolio
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            A curated showcase of work, reels and projects.
          </p>
        </div>

        <PortfolioTabs
          activeTab={activeTab}
          onChange={handleTabChange}
          counts={counts}
        />

        {items.length === 0 ? (
          <EmptyPortfolioState
            isOwner={isOwner}
            onAddWork={() => setAddOpen(true)}
          />
        ) : (
          <>
            {featuredItem && activeTab === "All" && (
              <FeaturedPortfolio
                item={featuredItem}
                isOwner={isOwner}
                onClick={() => handleItemClick(featuredItem)}
                onEdit={isOwner ? setEditItem : undefined}
              />
            )}

            {isOwner && items.length > 1 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setReorderOpen(true)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Reorder work
                </button>
              </div>
            )}

            <PortfolioGrid
              items={filteredItems}
              isOwner={isOwner}
              onItemClick={handleItemClick}
              onEdit={isOwner ? setEditItem : undefined}
            />

            {filteredItems.length === 0 && (
              <div className="mt-12 text-center">
                <p className="text-muted-foreground">
                  No {activeTab.toLowerCase()} items yet.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <PortfolioReelOverlay
        items={sortedItems}
        username={username}
        initialItemId={reelInitialItemId ?? undefined}
        isOwner={isOwner}
        open={reelOpen}
        onClose={handleCloseReel}
        onEdit={isOwner ? setEditItem : undefined}
        onToggleFeatured={isOwner ? handleToggleFeatured : undefined}
        onDelete={isOwner ? handleDelete : undefined}
        onShare={handleShare}
      />

      {isOwner && (
        <>
          <AddPortfolioModal
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onSubmit={handleAddWork}
            isSubmitting={isSubmitting}
          />
          <EditPortfolioModal
            item={editItem}
            open={!!editItem}
            onClose={() => setEditItem(null)}
            onSubmit={handleEdit}
            isSubmitting={updateItem.isPending}
          />
          <ReorderSheet
            items={items}
            open={reorderOpen}
            onClose={() => setReorderOpen(false)}
            onReorder={handleReorder}
            isSubmitting={reorder.isPending}
          />
        </>
      )}

      <ShareSheet
        url={
          shareItem
            ? `${typeof window !== "undefined" ? window.location.origin : ""}/talent/${username}/portfolio?item=${shareItem.id}`
            : ""
        }
        title={shareItem?.title || ""}
        open={!!shareItem}
        onClose={() => setShareItem(null)}
      />
    </div>
  );
}
