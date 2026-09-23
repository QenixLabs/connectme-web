"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText, Image as ImageIcon, Link2, Star, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import {
  useMyPortfolioCollection,
  useUpdatePortfolioItem,
  useDeletePortfolioItem,
} from "@/hooks/use-portfolio";
import { useMyProfile } from "@/hooks/use-talent-profile";
import type { PortfolioApiResponse } from "@/lib/api/talent";

import { mapApiToItem } from "./portfolio/types";
import { PortfolioHeader, type PortfolioUploadType } from "./portfolio/portfolio-header";
import { PortfolioGrid } from "./portfolio/portfolio-grid";
import { PortfolioSelectionBar } from "./portfolio/portfolio-selection-bar";
import { PortfolioLightbox } from "./portfolio/portfolio-lightbox";
import { ProfileHighlightsStatus } from "./portfolio/profile-highlights-status";
import { UploadDialog } from "./portfolio/dialogs/upload-dialog";
import { AddVideoDialog } from "./portfolio/dialogs/add-video-dialog";
import { ExternalLinkDialog } from "./portfolio/dialogs/external-link-dialog";
import { EditItemDialog } from "./portfolio/dialogs/edit-item-dialog";
import { DeleteConfirmDialog } from "./portfolio/dialogs/delete-confirm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function getErrorMessage(error: unknown, fallback: string) {
  const responseMessage = (error as { response?: { data?: { message?: unknown } } })
    .response?.data?.message;
  return typeof responseMessage === "string" ? responseMessage : fallback;
}

// ── Loading Skeleton ───────────────────────────────────────

function PortfolioSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 pb-28 pt-5 lg:px-6">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function AddMediaSheet({
  open,
  onOpenChange,
  onChoose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoose: (type: "image" | "video" | "document" | "link") => void;
}) {
  const choices = [
    { type: "image" as const, label: "Upload Photo", detail: "Add high-quality photos", Icon: ImageIcon },
    { type: "video" as const, label: "Upload Video", detail: "Upload from device", Icon: Video },
    { type: "document" as const, label: "Resume / Document", detail: "PDF, DOC", Icon: FileText },
    { type: "link" as const, label: "External Link", detail: "YouTube, Vimeo, etc.", Icon: Link2 },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8 sm:mx-auto sm:max-w-lg">
        <SheetHeader className="px-0 text-left">
          <SheetTitle>Add media</SheetTitle>
          <SheetDescription>Choose what you want to add to your library.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-2">
          {choices.map(({ type, label, detail, Icon }) => (
            <button
              type="button"
              key={type}
              onClick={() => {
                onOpenChange(false);
                onChoose(type);
              }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left transition-colors hover:bg-accent"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
              <span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className="block text-xs text-muted-foreground">{detail}</span></span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Main Component ─────────────────────────────────────────

export function PortfolioPage() {
  const router = useRouter();
  const [addMediaOpen, setAddMediaOpen] = useState(false);

  // Dialog states
  const [uploadType, setUploadType] = useState<"image" | "video" | "document" | null>(null);
  const [externalLinkOpen, setExternalLinkOpen] = useState(false);
  const [addVideoOpen, setAddVideoOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioApiResponse | null>(null);
  const [deletingItem, setDeletingItem] = useState<PortfolioApiResponse | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showreelCandidate, setShowreelCandidate] = useState<ReturnType<typeof mapApiToItem> | null>(null);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<ReturnType<typeof mapApiToItem>[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Queries
  const portfolioQuery = useMyPortfolioCollection();
  const profileQuery = useMyProfile();

  // Mutations
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();

  const rawItems = portfolioQuery.data?.items ?? [];
  const showcase = portfolioQuery.data?.profile_highlights;
  const showcaseIds = new Set([
    showcase?.showreel_id,
    ...(showcase?.video_ids ?? []),
    ...(showcase?.image_ids ?? []),
  ].filter((id): id is string => Boolean(id)));
  const items = rawItems.map((item) => ({
    ...mapApiToItem(item),
    selected: selectedIds.has(item.id),
    onProfile: showcaseIds.has(item.id),
  }));
  const ml = profileQuery.data?.media_limits;
  const imagesUsed = ml?.images_used ?? 0;
  const planMaxImages = ml?.plan_max_images ?? 5;
  const videosUsed = ml?.videos_used ?? 0;
  const planMaxVideos = ml?.plan_max_videos ?? 1;
  const selectedItems = items.filter((i) => selectedIds.has(i.id));

  const openMediaDialog = useCallback((type?: PortfolioUploadType) => {
    if (!type) {
      setAddMediaOpen(true);
      return;
    }
    if (type === "link") setExternalLinkOpen(true);
    else if (type === "video") setAddVideoOpen(true);
    else setUploadType(type);
  }, []);

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
      if (item.kind !== "image" && item.kind !== "video" && item.type !== "youtube") {
        return;
      }
      if (!item.highlightType) {
        const isImage = item.kind === "image";
        const selectedCount = items.filter(
          (candidate) => candidate.highlightType === (isImage ? "image" : "video"),
        ).length;
        const limit = isImage ? 4 : 3;
        if (selectedCount >= limit) {
          toast.error(
            isImage ? "4 photos already featured" : "3 videos already featured",
            {
              description: isImage
                ? "Remove a featured photo before adding another."
                : "Remove a featured video before adding another.",
              action: {
                label: "Manage Showcase",
                onClick: () => router.push("/talent/portfolio/showcase"),
              },
            },
          );
          return;
        }
      }

      try {
        await updateItem.mutateAsync({
          itemId: item.id,
          data: {
            profile_highlight_type: item.highlightType
              ? null
              : item.kind === "image"
                ? "image"
                : "video",
          },
        });
        toast.success(item.highlightType ? "Removed from public profile" : "Added to public profile");
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to update public profile selection"));
      }
    },
    [items, router, updateItem],
  );

  const handleSetShowreel = useCallback(
    async (item: ReturnType<typeof mapApiToItem>) => {
      if (item.kind !== "video" && item.type !== "youtube") return;
      if (item.highlightType === "showreel") {
        await handleTogglePin(item);
        return;
      }

      const currentShowreel = items.find((candidate) => candidate.highlightType === "showreel");
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
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to set showreel"));
      }
    },
    [handleTogglePin, items, updateItem],
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
      toast.success("Showreel replaced");
      setShowreelCandidate(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to replace showreel"));
    }
  }, [showreelCandidate, updateItem]);

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
    const toPin = selectedItems.filter(
      (i) => !i.highlightType && (i.kind === "image" || i.kind === "video" || i.type === "youtube"),
    );
    if (toPin.length === 0) {
      toast.info("Selected items already appear on your public profile");
      return;
    }
    try {
      for (const item of toPin) {
        await updateItem.mutateAsync({
          itemId: item.id,
          data: {
            profile_highlight_type: item.kind === "image" ? "image" : "video",
          },
        });
      }
      toast.success("Selected work added to public profile");
      clearSelection();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to feature selected work"));
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
        <div className="space-y-4 px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-5 lg:px-6 lg:pb-12">
        {/* Header */}
        <PortfolioHeader onAddMedia={openMediaDialog} />

        <ProfileHighlightsStatus items={items} showcase={showcase} />

        {/* Grid with tabs */}
        <PortfolioGrid
          items={items}
          usage={{ imagesUsed, planMaxImages, videosUsed, planMaxVideos }}
          onEdit={(item) =>
            setEditingItem(rawItems.find((r) => r.id === item.id) ?? null)
          }
          onDelete={(item) =>
            setDeletingItem(rawItems.find((r) => r.id === item.id) ?? null)
          }
          onTogglePin={handleTogglePin}
          onSetShowreel={handleSetShowreel}
          onOpen={openLightbox}
          onToggleSelect={toggleSelect}
             onAddMedia={() => openMediaDialog()}
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
      <AddMediaSheet
        open={addMediaOpen}
        onOpenChange={setAddMediaOpen}
        onChoose={(type) => {
          if (type === "link") setExternalLinkOpen(true);
          else if (type === "video") setAddVideoOpen(true);
          else setUploadType(type);
        }}
      />
      <UploadDialog
        open={uploadType !== null}
        onOpenChange={(o) => { if (!o) setUploadType(null); }}
         type={uploadType ?? "image"}
      />
      <AddVideoDialog open={addVideoOpen} onOpenChange={setAddVideoOpen} />
      <ExternalLinkDialog open={externalLinkOpen} onOpenChange={setExternalLinkOpen} />
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
            {[items.find((item) => item.highlightType === "showreel"), showreelCandidate]
              .filter(Boolean)
              .map((item, index) => (
                <div key={item!.id} className="min-w-0">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                    <img src={item!.image} alt={item!.title} className="h-full w-full object-cover" />
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
              <Star className="mr-2 size-4" /> Replace Showreel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
