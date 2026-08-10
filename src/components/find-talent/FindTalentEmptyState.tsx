import { Search } from "lucide-react";

interface FindTalentEmptyStateProps {
  hasFilters: boolean;
}

export function FindTalentEmptyState({ hasFilters }: FindTalentEmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a1420] p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-500">
        <Search size={20} />
      </div>
      <p className="text-sm font-medium text-slate-300">No talent found</p>
      <p className="mt-1 text-xs text-slate-500">
        {hasFilters
          ? "Try adjusting your filters or search query."
          : "No talent profiles available yet."}
      </p>
    </div>
  );
}
