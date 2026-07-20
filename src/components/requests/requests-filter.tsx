"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, MessageSquare } from "lucide-react";

type SortKey = "newest" | "oldest";

interface RequestsFilterProps {
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  showMessageFilter?: boolean;
  hasMessageOnly?: boolean;
  onHasMessageToggle?: () => void;
  className?: string;
}

export function RequestsFilter({
  sort,
  onSortChange,
  showMessageFilter = false,
  hasMessageOnly = false,
  onHasMessageToggle,
  className,
}: RequestsFilterProps) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <button
        onClick={() => onSortChange("newest")}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
          sort === "newest"
            ? "bg-foreground text-background border-foreground"
            : "bg-card text-text-secondary border-border hover:bg-muted"
        )}
      >
        <ArrowDown className="w-3 h-3" strokeWidth={2} />
        Newest
      </button>
      <button
        onClick={() => onSortChange("oldest")}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
          sort === "oldest"
            ? "bg-foreground text-background border-foreground"
            : "bg-card text-text-secondary border-border hover:bg-muted"
        )}
      >
        <ArrowUp className="w-3 h-3" strokeWidth={2} />
        Oldest
      </button>
      {showMessageFilter && (
        <button
          onClick={onHasMessageToggle}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
            hasMessageOnly
              ? "bg-brand-soft text-ink border-brand/30"
              : "bg-card text-text-secondary border-border hover:bg-muted"
          )}
        >
          <MessageSquare className="w-3 h-3" strokeWidth={2} />
          Has message
        </button>
      )}
    </div>
  );
}
