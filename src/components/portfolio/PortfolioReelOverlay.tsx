"use client";

import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { PortfolioReel } from "./PortfolioReel";

interface PortfolioReelOverlayProps {
  items: PortfolioItem[];
  username: string;
  initialItemId?: string;
  isOwner?: boolean;
  open: boolean;
  onClose: () => void;
  onEdit?: (item: PortfolioItem) => void;
  onToggleFeatured?: (item: PortfolioItem) => void;
  onDelete?: (item: PortfolioItem) => void;
  onShare?: (item: PortfolioItem) => void;
}

export function PortfolioReelOverlay({
  items,
  username,
  initialItemId,
  isOwner,
  open,
  onClose,
  onEdit,
  onToggleFeatured,
  onDelete,
  onShare,
}: PortfolioReelOverlayProps) {
  const initialIndex = initialItemId
    ? Math.max(items.findIndex((item) => item.id === initialItemId), 0)
    : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 top-0 left-0 z-50 m-0 h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-none border-none bg-black p-0"
      >
        <DialogTitle className="sr-only">Portfolio reel</DialogTitle>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          className="fixed left-4 top-4 z-50 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
          aria-label="Close reel"
        >
          <ArrowLeft className="size-5" />
        </Button>

        <PortfolioReel
          items={items}
          username={username}
          isOwner={isOwner}
          initialIndex={initialIndex}
          className="h-[100dvh]"
          onEdit={onEdit}
          onToggleFeatured={onToggleFeatured}
          onDelete={onDelete}
          onShare={onShare}
        />
      </DialogContent>
    </Dialog>
  );
}
