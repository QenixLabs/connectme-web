"use client";

export type TabId =
  | "overview"
  | "portfolio"
  | "experience"
  | "skills"
  | "media-kit"
  | "reviews"
  | "about";

interface Tab {
  id: TabId;
  label: string;
}

const DEFAULT_TABS: Tab[] = [
  { id: "overview", label: "Overview" },
  { id: "portfolio", label: "Portfolio" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "media-kit", label: "Media Kit" },
  { id: "reviews", label: "Reviews" },
  { id: "about", label: "About" },
];

interface TabNavigationProps {
  value: TabId;
  onChange: (id: TabId) => void;
  tabs?: Tab[];
}

export function TabNavigation({ value, onChange, tabs = DEFAULT_TABS }: TabNavigationProps) {
  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <div className="flex w-full justify-start gap-1 border-b border-border bg-transparent p-0">
          {tabs.map((t) => {
            const active = value === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={`h-12 shrink-0 rounded-none border-b-2 bg-transparent px-4 text-sm font-medium transition-colors ${
                  active
                    ? "border-amber text-amber"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
