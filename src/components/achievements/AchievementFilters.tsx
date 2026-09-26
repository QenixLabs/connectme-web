import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ACHIEVEMENT_FILTERS, type AchievementFilter } from "./achievement-types";

interface AchievementFiltersProps {
  value: AchievementFilter;
  onChange: (value: AchievementFilter) => void;
  showCredits?: boolean;
}

export function AchievementFilters({
  value,
  onChange,
  showCredits = false,
}: AchievementFiltersProps) {
  const filters = showCredits
    ? [...ACHIEVEMENT_FILTERS, { value: "credit" as const, label: "Credits" }]
    : ACHIEVEMENT_FILTERS;

  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {filters.map((filter) => {
        const active = value === filter.value;
        return (
          <Button
            key={filter.value}
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={active}
            onClick={() => onChange(filter.value)}
            className={cn(
              "min-h-10 shrink-0 rounded-full px-4 text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6846d9]/40",
              active
                ? "bg-gradient-to-r from-[#4d20ed] via-[#7732ed] to-[#d23bf3] text-white shadow-[0_8px_18px_rgba(111,45,226,0.23)]"
                : "bg-[#f1f1fb] text-[#17245b] hover:bg-[#e9e7fa]",
            )}
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
