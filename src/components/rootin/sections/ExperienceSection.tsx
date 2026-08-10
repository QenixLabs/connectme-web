"use client";

import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, SectionHead, Pill, EmptyState } from "../primitives";
import { getDisplayMode } from "./types";
import type { ExperienceItem } from "./types";

export interface ExperienceSectionProps {
  data: ExperienceItem[];
  className?: string;
}

export function ExperienceSection({ data, className }: ExperienceSectionProps) {
  const mode = getDisplayMode(data.length);

  return (
    <Card prominent className={cn("transition-all duration-300 ease-out", className)}>
      <SectionHead
        icon={<Briefcase width={16} height={16} />}
        title="Experience"
        action="View All"
      />

      {mode === "empty" ? (
        <EmptyState icon={<Briefcase width={32} height={32} />} message="No experience added yet." />
      ) : (
        <div
          className={cn(
            "transition-all duration-300 ease-out",
            mode === "expanded" && "overflow-auto",
          )}
          style={mode === "expanded" ? { maxHeight: "min(420px, 55vh)" } : undefined}
        >
          <ol className="relative space-y-6 border-l border-accent/20 pl-6">
            {data.map((e, i) => (
              <li
                key={`${e.role}-${i}`}
                className={cn(
                  "relative transition-all duration-300 ease-out",
                  i === data.length - 1 && "pb-0",
                )}
              >
                <span className="absolute -left-[29px] top-1.5 h-2 w-2 rounded-full bg-accent shadow-[var(--glow-accent)]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/40">
                  {e.years}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground/80">{e.role}</h3>
                  <Pill className="border-accent/20 bg-accent/6 text-accent/70">{e.pill}</Pill>
                </div>
                <p className="mt-1 text-xs text-muted-foreground/50">{e.company}</p>
                <p className="text-xs leading-relaxed text-foreground/55">{e.description}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}
