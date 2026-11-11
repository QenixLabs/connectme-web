"use client";

interface CategoryChipsProps {
  categories: readonly string[];
  selectedCategory?: string;
  onSelect: (category?: string) => void;
}

export function CategoryChips({
  categories,
  selectedCategory,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div
      role="group"
      aria-label="Filter services by category"
      className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
    >
      <button
        type="button"
        aria-pressed={!selectedCategory}
        onClick={() => onSelect(undefined)}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-700 focus-visible:ring-offset-2 ${
          !selectedCategory
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-800 ring-1 ring-slate-300 hover:ring-slate-400"
        }`}
      >
        All
      </button>
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(isSelected ? undefined : category)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-700 focus-visible:ring-offset-2 ${
              isSelected
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-800 ring-1 ring-slate-300 hover:ring-slate-400"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
