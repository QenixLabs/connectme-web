"use client";

import { Pin, Trash2, Star, Loader2 } from "lucide-react";

export function PortfolioSelectionBar({
  count,
  onPin,
  onDelete,
  onClear,
  isPending,
}: {
  count: number;
  onPin: () => void;
  onDelete: () => void;
  onClear: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-x-0 bottom-[80px] z-40 mx-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card lg:bottom-4 lg:left-6 lg:right-6 lg:mx-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-teal">
          <Star className="h-3 w-3 fill-accent-foreground text-accent-foreground" />
        </span>
        <span className="truncate text-sm font-medium">
          {count} {count === 1 ? "item" : "items"} selected
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onPin}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-accent"
        >
          <Pin className="h-4 w-4" /> Pin
        </button>
        <button
          onClick={onDelete}
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl border border-destructive/50 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}{" "}
          Delete
        </button>
        <button
          onClick={onClear}
          className="text-sm font-medium text-teal"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
