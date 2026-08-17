"use client";

import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyPortfolioStateProps {
  isOwner?: boolean;
  onAddWork?: () => void;
}

export function EmptyPortfolioState({
  isOwner,
  onAddWork,
}: EmptyPortfolioStateProps) {
  return (
    <div className="portfolio-card mt-12 flex flex-col items-center rounded-2xl p-8 text-center sm:mt-16 sm:p-12">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="size-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-foreground">
        {isOwner ? "Your portfolio is empty" : "No work to show"}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        {isOwner
          ? "Add photos, videos, or YouTube projects to showcase your work to recruiters."
          : "This talent hasn’t added any portfolio items yet."}
      </p>
      {isOwner && (
        <Button
          onClick={onAddWork}
          className="mt-6 gap-1.5 rounded-xl bg-primary px-5 text-primary-foreground shadow-button hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add Your First Work
        </Button>
      )}
    </div>
  );
}
