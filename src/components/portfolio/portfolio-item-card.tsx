"use client";

import { useState, useRef, useEffect } from "react";
import { Pin, Trash2, GripVertical, Play } from "lucide-react";
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
}

export function PortfolioItemCard({
  item,
  onUpdate,
  onDelete,
}: PortfolioItemCardProps) {
  const [caption, setCaption] = useState(item.caption || "");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (caption !== (item.caption || "")) {
      onUpdate(item.id, { caption });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const isIntro = item.category === "intro";

  return (
    <div
      className={cn(
        "group relative w-full bg-card rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-md",
        isIntro && item.is_pinned && "ring-2 ring-brand"
      )}
    >
      {/* Preview */}
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
              <Play className="w-10 h-10 text-white/80" strokeWidth={1.5} />
            </div>
          </div>
        )}

        {/* Drag handle — always visible, top-left */}
        <div className="absolute top-2 left-2 z-10" data-drag-handle>
          <div className="p-1.5 rounded-lg bg-black/50 text-white/80 cursor-grab active:cursor-grabbing backdrop-blur-sm touch-none">
            <GripVertical className="w-3.5 h-3.5" strokeWidth={1.5} />
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-10 z-10">
          <span
            className={cn(
              "px-2 py-0.5 text-2xs font-medium rounded-full uppercase",
              item.type === "image"
                ? "bg-black/60 text-white"
                : "bg-destructive/80 text-white"
            )}
          >
            {item.type}
          </span>
        </div>

        {/* Category badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-black/60 text-white uppercase">
            {item.category}
          </span>
        </div>

        {/* Actions overlay */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onUpdate(item.id, { is_pinned: !item.is_pinned })}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                item.is_pinned
                  ? "bg-brand text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              )}
              title={item.is_pinned ? "Unpin" : "Pin"}
            >
              <Pin className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="p-2.5 space-y-2">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Add caption..."
            className="w-full text-xs bg-transparent border-b border-brand focus:outline-none pb-0.5"
          />
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            className={cn(
              "text-xs truncate cursor-text",
              item.caption ? "text-text-primary" : "text-text-muted italic"
            )}
          >
            {item.caption || "Add caption..."}
          </p>
        )}

        {/* Category selector */}
        <div className="flex items-center gap-1">
          {(["work", "personal", "intro"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => onUpdate(item.id, { category: cat })}
              className={cn(
                "px-2 py-0.5 text-2xs font-medium rounded-full uppercase transition-colors",
                item.category === cat
                  ? cat === "intro"
                    ? "bg-brand text-white"
                    : "bg-muted-bg text-text-primary border border-border"
                  : "text-text-muted hover:text-text-secondary hover:bg-muted-bg/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
