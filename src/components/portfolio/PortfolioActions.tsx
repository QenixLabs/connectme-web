"use client";

import {
  MoreVertical,
  Pencil,
  Star,
  StarOff,
  GripVertical,
  Copy,
  Share2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PortfolioItem } from "@/lib/types/portfolio";

interface PortfolioActionsProps {
  item: PortfolioItem;
  username?: string;
  onEdit?: (item: PortfolioItem) => void;
  onToggleFeatured?: (item: PortfolioItem) => void;
  onReorder?: () => void;
  onShare?: (item: PortfolioItem) => void;
  onDelete?: (item: PortfolioItem) => void;
}

export function PortfolioActions({
  item,
  username,
  onEdit,
  onToggleFeatured,
  onReorder,
  onShare,
  onDelete,
}: PortfolioActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onToggleFeatured && (
          <DropdownMenuItem onClick={() => onToggleFeatured(item)}>
            {item.isFeatured ? (
              <>
                <StarOff className="size-4" />
                Remove from Featured
              </>
            ) : (
              <>
                <Star className="size-4" />
                Set as Featured
              </>
            )}
          </DropdownMenuItem>
        )}
        {onReorder && (
          <DropdownMenuItem onClick={onReorder}>
            <GripVertical className="size-4" />
            Reorder
          </DropdownMenuItem>
        )}
        {onShare && (
          <DropdownMenuItem onClick={() => onShare(item)}>
            <Share2 className="size-4" />
            Share
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            const url = `${window.location.origin}/talent/${username || item.userId || ""}/portfolio?item=${item.id}`;
            void navigator.clipboard.writeText(url);
          }}
        >
          <Copy className="size-4" />
          Copy Link
        </DropdownMenuItem>
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
