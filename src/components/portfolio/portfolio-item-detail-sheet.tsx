"use client";

import { useState } from "react";
import { Pin, Trash2, Play, X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

interface PortfolioItemDetailSheetProps {
  item: PortfolioItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    id: string,
    dto: {
      caption?: string;
      title?: string;
      description?: string;
      category?: "work" | "personal" | "intro";
      is_pinned?: boolean;
    }
  ) => void;
  onDelete: (id: string) => void;
}

export function PortfolioItemDetailSheet({
  item,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: PortfolioItemDetailSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");

  if (!item) return null;

  const handleOpenChange = (open: boolean) => {
    if (open && item) {
      setTitle(item.title || "");
      setDescription(item.description || "");
      setCaption(item.caption || "");
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 max-w-lg mx-auto">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-sm font-semibold">
                {item.type === "image" ? "Image" : "Video"} details
              </SheetTitle>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="relative w-full bg-black">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.caption || "Portfolio item"}
                  className="w-full max-h-[40vh] object-contain"
                />
              ) : (
                <div className="relative w-full">
                  <video
                    src={item.url}
                    controls
                    className="w-full max-h-[40vh]"
                    playsInline
                  />
                </div>
              )}
            </div>

            <div className="p-4 space-y-5">
              {/* Title input */}
              <div>
                <label className="text-[11px] font-medium text-text-muted uppercase tracking-wider block mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => {
                    if (title !== (item.title || "")) {
                      onUpdate(item.id, { title });
                    }
                  }}
                  placeholder="Add a title..."
                  maxLength={120}
                  className="w-full text-sm bg-transparent border-0 border-b border-border px-0 py-1.5 focus:outline-none focus:border-brand text-text-primary placeholder:text-text-muted"
                />
              </div>

              {/* Description input */}
              <div>
                <label className="text-[11px] font-medium text-text-muted uppercase tracking-wider block mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => {
                    if (description !== (item.description || "")) {
                      onUpdate(item.id, { description });
                    }
                  }}
                  placeholder="Add a description..."
                  maxLength={200}
                  className="w-full text-sm bg-transparent border-0 border-b border-border px-0 py-1.5 focus:outline-none focus:border-brand text-text-primary placeholder:text-text-muted"
                />
              </div>

              {/* Caption input */}
              <div>
                <label className="text-[11px] font-medium text-text-muted uppercase tracking-wider block mb-1.5">
                  Caption
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  onBlur={() => {
                    if (caption !== (item.caption || "")) {
                      onUpdate(item.id, { caption });
                    }
                  }}
                  placeholder="Alt text / caption..."
                  className="w-full text-sm bg-transparent border-0 border-b border-border px-0 py-1.5 focus:outline-none focus:border-brand text-text-primary placeholder:text-text-muted"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="text-[11px] font-medium text-text-muted uppercase tracking-wider block mb-1.5">
                  Category
                </label>
                <div className="flex gap-2">
                  {(["work", "personal", "intro"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => onUpdate(item.id, { category: cat })}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-colors border",
                        item.category === cat
                          ? cat === "intro"
                            ? "bg-brand text-white border-brand"
                            : "bg-foreground text-background border-foreground"
                          : "bg-card text-text-secondary border-border hover:bg-muted"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* View count */}
              {(item.view_count ?? 0) > 0 && (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{item.view_count} view{item.view_count !== 1 ? "s" : ""}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs"
                  onClick={() => onUpdate(item.id, { is_pinned: !item.is_pinned })}
                >
                  <Pin
                    className={cn(
                      "w-3.5 h-3.5 mr-1.5",
                      item.is_pinned && "fill-current"
                    )}
                    strokeWidth={1.5}
                  />
                  {item.is_pinned ? "Unpin" : "Pin"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs text-destructive hover:bg-error-light hover:text-error hover:border-error-border"
                  onClick={() => {
                    onDelete(item.id);
                    onOpenChange(false);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                  Delete
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
