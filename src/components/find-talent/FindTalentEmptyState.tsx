import { Search, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FindTalentEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function FindTalentEmptyState({ hasFilters, onClearFilters }: FindTalentEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center md:py-20">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface shadow-lg">
          {hasFilters ? (
            <Search className="size-7 text-primary" />
          ) : (
            <Users className="size-7 text-primary" />
          )}
        </div>
      </div>

      <h3 className="mt-5 text-lg font-semibold text-foreground">
        {hasFilters ? "No matching talent found" : "No talent profiles yet"}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {hasFilters
          ? "Try adjusting your search or filters to discover more talent."
          : "Talent profiles will appear here once creators join the platform."}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {hasFilters && onClearFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="rounded-xl border-border bg-surface/60 px-5 text-sm font-medium text-foreground hover:bg-surface hover:text-foreground"
          >
            Clear filters
          </Button>
        )}
        <Button className="gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-button transition-all hover:bg-primary/90 hover:shadow-button-hover active:scale-[0.98]">
          <Sparkles className="size-4" />
          Post a campaign
        </Button>
      </div>
    </div>
  );
}
