"use client";

/* eslint-disable @next/next/no-img-element */

import { Suspense, useState, useMemo, useCallback } from "react";
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
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { PortfolioReelOverlay } from "@/components/portfolio/PortfolioReelOverlay";
import { AddPortfolioModal } from "@/components/portfolio/AddPortfolioModal";
import { EditPortfolioModal } from "@/components/portfolio/EditPortfolioModal";
import { ReorderSheet } from "@/components/portfolio/ReorderSheet";
import { ShareSheet } from "@/components/portfolio/ShareSheet";
import { EmptyPortfolioState } from "@/components/portfolio/EmptyPortfolioState";
import { PortfolioSkeleton } from "@/components/portfolio/PortfolioSkeleton";
import { ProfileHighlightsStatus } from "@/components/talent-app/portfolio/profile-highlights-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function PortfolioContent() {
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
  const [showreelCandidate, setShowreelCandidate] = useState<PortfolioItem | null>(null);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [shareItem, setShareItem] = useState<PortfolioItem | null>(null);

  const uploadImage = useUploadPortfolioImage();
  const uploadVideo = useUploadPortfolioVideo();
  const uploadYouTube = useUploadPortfolioYouTube();
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();
  const reorder = useReorderPortfolio();

  const isSubmitting =
    uploadImage.isPending ||
    uploadVideo.isPending ||
    uploadYouTube.isPending ||
    updateItem.isPending ||
    deleteItem.isPending ||
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

  const filteredItems = useMemo(() => {
    return filterPortfolioItems(sortedItems, activeTab);
  }, [sortedItems, activeTab]);

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
        const currentItem = items.find((item) => item.id === itemId);
        await updateItem.mutateAsync({
          itemId,
          data: {
            title: data.title,
            caption: data.title,
            description: data.description,
            profile_highlight_type: data.isFeatured
              ? currentItem?.profileHighlightType || (currentItem?.type === "image" ? "image" : "video")
              : null,
            category: "work",
          },
        });
        toast.success("Changes saved");
        setEditItem(null);
      } catch {
        toast.error("Failed to save changes");
      }
    },
    [items, updateItem],
  );

  const handleToggleFeatured = useCallback(
    async (item: PortfolioItem) => {
      if (!item.profileHighlightType) {
        const isImage = item.type === "image";
        const count = items.filter(
          (candidate) => candidate.profileHighlightType === (isImage ? "image" : "video"),
        ).length;
        if (count >= (isImage ? 4 : 3)) {
          toast.error(isImage ? "4 photos already featured" : "3 videos already featured", {
            description: isImage
              ? "Remove a featured photo before adding another."
              : "Remove a featured video before adding another.",
          });
          return;
        }
      }

      try {
        await updateItem.mutateAsync({
          itemId: item.id,
          data: {
            profile_highlight_type: item.profileHighlightType
              ? null
              : item.type === "image"
                ? "image"
                : "video",
          },
        });
        toast.success(item.profileHighlightType ? "Removed from public profile" : "Added to public profile");
      } catch {
        toast.error("Failed to update public profile selection");
      }
    },
    [items, updateItem],
  );

  const handleSetShowreel = useCallback(
    async (item: PortfolioItem) => {
      if (item.profileHighlightType === "showreel") {
        await handleToggleFeatured(item);
        return;
      }
      const currentShowreel = items.find((candidate) => candidate.profileHighlightType === "showreel");
      if (currentShowreel) {
        setShowreelCandidate(item);
        return;
      }
      try {
        await updateItem.mutateAsync({
          itemId: item.id,
          data: { profile_highlight_type: "showreel" },
        });
        toast.success("Showreel added to public profile");
      } catch {
        toast.error("Failed to set showreel");
      }
    },
    [handleToggleFeatured, items, updateItem],
  );

  const replaceShowreel = useCallback(async () => {
    if (!showreelCandidate) return;
    try {
      await updateItem.mutateAsync({
        itemId: showreelCandidate.id,
        data: {
          profile_highlight_type: "showreel",
          replace_profile_highlight: true,
        },
      });
      setShowreelCandidate(null);
      toast.success("Showreel replaced");
    } catch {
      toast.error("Failed to replace showreel");
    }
  }, [showreelCandidate, updateItem]);

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

        {isOwner && <ProfileHighlightsStatus items={items} />}

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
              onToggleFeatured={isOwner ? handleToggleFeatured : undefined}
              onSetShowreel={isOwner ? handleSetShowreel : undefined}
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

      <Dialog
        open={!!showreelCandidate}
        onOpenChange={(open) => !open && setShowreelCandidate(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Replace featured showreel?</DialogTitle>
            <DialogDescription>
              Your public profile can show one showreel. Choose which work should appear first.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[items.find((item) => item.profileHighlightType === "showreel"), showreelCandidate]
              .filter(Boolean)
              .map((item, index) => (
                <div key={item!.id} className="min-w-0">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                    <img
                      src={item!.thumbnailUrl || item!.url}
                      alt={item!.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-2 top-2 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold">
                      {index === 0 ? "Current" : "New"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs font-medium">{item!.title}</p>
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowreelCandidate(null)}>
              Cancel
            </Button>
            <Button onClick={replaceShowreel} disabled={updateItem.isPending}>
              Replace Showreel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PortfolioSkeleton />}>
      <PortfolioContent />
    </Suspense>
  );
}
