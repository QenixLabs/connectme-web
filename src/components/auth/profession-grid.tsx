"use client";

import { useState, useMemo } from "react";
import {
  Clapperboard,
  Camera,
  Mic,
  Music,
  Video,
  MonitorPlay,
  Film,
  PenLine,
  Scissors,
  Move,
  Palette,
  Shirt,
  BadgeCheck,
  Smile,
  Baby,
  Sparkles,
  Music2,
  Volume2,
  Aperture,
  Search,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PROFESSIONS, type Profession } from "@/lib/constants/professions";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const iconMap: Record<string, LucideIcon> = {
  Actor: Clapperboard,
  Model: Camera,
  Singer: Mic,
  Musician: Music,
  Dancer: Music2,
  "Voice Artist": Volume2,
  Anchor: MonitorPlay,
  Influencer: Video,
  Director: Film,
  Writer: PenLine,
  Photographer: Aperture,
  Cinematographer: Video,
  Editor: Scissors,
  Choreographer: Move,
  "Makeup Artist": Palette,
  Stylist: Shirt,
  Producer: BadgeCheck,
  Comedian: Smile,
  "Child Artist": Baby,
  "Other Creative Roles": Sparkles,
};

const POPULAR_PROFESSIONS: Profession[] = [
  "Actor",
  "Model",
  "Singer",
  "Musician",
  "Influencer",
  "Photographer",
];

interface ProfessionGridProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ProfessionGrid({ value, onChange, className }: ProfessionGridProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => PROFESSIONS.filter((p) => p.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const renderCard = (profession: Profession) => {
    const Icon = iconMap[profession] ?? Sparkles;
    const isSelected = value === profession;
    return (
      <button
        key={profession}
        type="button"
        onClick={() => onChange(profession)}
        className={cn(
          "flex flex-col items-center gap-1.5 rounded-xl border border-border bg-secondary/20 px-2 py-3 text-xs transition-all duration-200 sm:px-3",
          isSelected
            ? "border-primary bg-primary/10 font-medium text-primary shadow-[var(--glow-accent)]"
            : "border-border bg-secondary/20 text-foreground/80 hover:border-primary/20 hover:bg-secondary/40",
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
        {profession}
      </button>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Popular choices
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {POPULAR_PROFESSIONS.map(renderCard)}
        </div>
      </div>

      <div className="border-t border-border/40 pt-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
        >
          <span className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground" strokeWidth={1.5} />
            View all professions
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl" showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>All professions</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-2 pt-2">
            <Input
              placeholder="Search profession..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-lg"
            />
          </div>
          <div className="grid max-h-[50vh] grid-cols-3 gap-2.5 overflow-y-auto px-4 pb-6 pt-2">
            {filtered.map(renderCard)}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
