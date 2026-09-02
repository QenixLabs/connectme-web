"use client";

/* eslint-disable @next/next/no-img-element */

import { Eye, Pin, Play, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "./types";

export function PortfolioFeatured({
  item,
  onOpen,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  item: PortfolioItem;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-teal/30 bg-card shadow-card transition-all duration-300 hover:shadow-card-lift">
      <button onClick={onOpen} className="relative block w-full text-left">
        <div className="aspect-[21/9] w-full overflow-hidden sm:aspect-[3/1]">
          <img
            src={item.image}
            alt={item.title}
            width={1200}
            height={500}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

        {/* Pin badge */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-teal/90 px-2.5 py-1 text-[11px] font-bold tracking-wide text-accent-foreground">
            <Pin className="h-3 w-3" /> FEATURED
          </span>
          <span
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide text-foreground",
              item.tag === "WORK"
                ? "bg-orange/90"
                : item.tag === "PERSONAL"
                  ? "bg-purple/90"
                  : "bg-teal/90",
            )}
          >
            {item.tag}
          </span>
        </div>

        {/* Play overlay for videos */}
        {item.kind === "video" && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-background/50 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              <Play className="h-6 w-6 fill-foreground" />
            </span>
          </div>
        )}

        {item.kind === "link" && (
          <span className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-lg bg-background/85">
            <ExternalLink className="h-4 w-4" />
          </span>
        )}

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            {item.title}
          </h2>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            {item.linkLabel && (
              <span className="font-medium">{item.linkLabel}</span>
            )}
            <span>{item.date}</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {item.views} views
            </span>
          </div>
        </div>
      </button>

      {/* Actions */}
      <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className="grid h-8 w-8 place-items-center rounded-lg bg-background/80 text-teal backdrop-blur-sm transition-colors hover:bg-background"
          title="Unpin"
        >
          <Pin className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="grid h-8 w-8 place-items-center rounded-lg bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="grid h-8 w-8 place-items-center rounded-lg bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
