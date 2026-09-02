"use client";

/* eslint-disable @next/next/no-img-element */

import {
  Image as ImageIcon,
  Eye,
  Pin,
  Play,
  ExternalLink,
  Trash2,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "./types";

export function PortfolioItemCard({
  item,
  onToggleSelect,
  onEdit,
  onDelete,
  onTogglePin,
  onOpen,
}: {
  item: PortfolioItem;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lift">
      <button
        onClick={onOpen}
        className="relative block aspect-[16/10] w-full overflow-hidden text-left"
      >
        <img
          src={item.image}
          alt={item.title}
          width={800}
          height={600}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={cn(
            "absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-md border-2 transition-colors",
            item.selected
              ? "border-teal bg-teal/25"
              : "border-foreground/50 bg-background/50",
          )}
          aria-label="Select item"
        >
          {item.selected && <div className="h-2.5 w-2.5 rounded-sm bg-teal" />}
        </button>

        <div className="absolute right-3 top-3 flex items-center gap-2">
          {item.pinned && (
            <span className="rounded-md bg-background/80 px-2 py-1 text-[10px] font-bold tracking-wide">
              PINNED
            </span>
          )}
          <span
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-bold tracking-wide text-foreground",
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

        {item.kind === "video" && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-background/60 backdrop-blur">
              <Play className="h-5 w-5 fill-foreground" />
            </span>
          </div>
        )}

        {item.kind === "link" && (
          <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-lg bg-background/85">
            <ExternalLink className="h-4 w-4" />
          </span>
        )}

        {item.kind === "image" && (
          <span className="absolute bottom-3 left-3 grid h-8 w-8 place-items-center rounded-lg bg-background/85">
            <ImageIcon className="h-4 w-4" />
          </span>
        )}
      </button>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{item.title}</h3>
          <p className="mt-1 flex items-center gap-2 truncate text-xs text-muted-foreground">
            {item.linkLabel && (
              <span className="font-medium text-foreground/80">
                {item.linkLabel} ·
              </span>
            )}
            {item.date}
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {item.views} views
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onTogglePin}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              item.pinned
                ? "text-teal bg-teal/15"
                : "text-muted-foreground hover:bg-accent",
            )}
            title={item.pinned ? "Unpin" : "Pin"}
          >
            <Pin className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
