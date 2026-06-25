"use client";

import { Pin, Trash2, GripVertical, Play, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

interface PortfolioItemCardProps {
  item: PortfolioItem;
  onUpdate: (
    id: string,
    dto: {
      caption?: string;
      category?: "work" | "personal" | "intro";
      is_pinned?: boolean;
    }
  ) => void;
  onDelete: (id: string) => void;
  onSelect: (item: PortfolioItem) => void;
}

export function PortfolioItemCard({
  item,
  onUpdate,
  onDelete,
  onSelect,
}: PortfolioItemCardProps) {
  const isIntro = item.category === "intro";

  return (
    <div
      className={cn(
        "group relative w-full bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-ink/5",
        isIntro && item.is_pinned && "ring-1 ring-brand/50",
        isIntro && "bg-cream-soft/50"
      )}
    >
      <div className="relative w-full pt-[100%] bg-muted">
        {item.type === "image" ? (
          <img
            src={item.url}
            alt={item.caption || "Portfolio image"}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
            <video
              src={item.url}
              className="absolute inset-0 w-full h-full object-cover"
              preload="metadata"
              muted
              playsInline
              draggable={false}
              onMouseEnter={(e) => {
                e.currentTarget.play()?.catch(() => {});
              }}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                <Play className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )}

        {isIntro && item.is_pinned && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brand text-white uppercase tracking-wider">
              Pinned
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 cursor-pointer"
          onClick={() => onSelect(item)}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Maximize2 className="w-4 h-4 text-ink" strokeWidth={1.5} />
            </div>
          </div>

          {/* Drag handle */}
          <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" data-drag-handle>
            <div className="p-1.5 rounded-lg bg-white/90 text-ink shadow-sm cursor-grab active:cursor-grabbing backdrop-blur-sm">
              <GripVertical className="w-3 h-3" strokeWidth={1.5} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(item.id, { is_pinned: !item.is_pinned });
              }}
              className={cn(
                "p-2 rounded-lg transition-colors shadow-sm",
                item.is_pinned
                  ? "bg-brand text-white"
                  : "bg-white/90 text-ink hover:bg-white"
              )}
              title={item.is_pinned ? "Unpin" : "Pin"}
            >
              <Pin className={cn("w-3.5 h-3.5", item.is_pinned && "fill-current")} strokeWidth={1.5} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-2 rounded-lg bg-white/90 text-ink hover:bg-error hover:text-white transition-colors shadow-sm"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {item.caption && (
        <div className="px-3 py-2.5">
          <p className="text-xs text-text-secondary leading-snug truncate">{item.caption}</p>
        </div>
      )}
    </div>
  );
}
