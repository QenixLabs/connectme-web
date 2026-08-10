"use client";

import { Calendar, Eye, Globe, MoveVertical, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, SectionHead, EmptyState } from "../primitives";
import { getDisplayMode } from "./types";
import type { Fact, TalentData } from "./types";

const factIcons: Record<string, React.ComponentType<{ width?: number; height?: number; className?: string }>> = {
  calendar: Calendar,
  height: MoveVertical,
  globe: Globe,
  eye: Eye,
};

export interface AboutSectionProps {
  talent: TalentData;
  facts: Fact[];
  stacked?: boolean;
  className?: string;
}

export function AboutSection({ talent, facts, stacked = false, className }: AboutSectionProps) {
  const mode = getDisplayMode(facts.length);

  return (
    <Card prominent className={cn("transition-all duration-300 ease-out", className)}>
      <SectionHead icon={<User width={16} height={16} />} title="About" />
      <div className={cn("gap-6 transition-all duration-300 ease-out", stacked ? "space-y-6" : "grid md:grid-cols-2")}>
        <p
          className={cn(
            "text-sm leading-relaxed text-foreground/65 transition-all duration-300 ease-out",
            mode === "compact" && "max-w-prose line-clamp-3",
            mode === "normal" && "max-w-prose",
            mode === "expanded" && "max-w-prose",
          )}
        >
          {talent.bio}
        </p>
        {mode === "empty" ? (
          <EmptyState icon={<User width={32} height={32} />} message="No details added yet." />
        ) : (
          <div
            className={cn(
              "grid gap-3 md:mt-0 transition-all duration-300 ease-out",
              mode === "compact" ? "grid-cols-1" : "grid-cols-2",
            )}
          >
            {facts.map((f) => {
              const Icon = factIcons[f.icon];
              return (
                <div
                  key={f.label}
                  className="flex items-start gap-2 rounded-xl border bg-surface p-3 transition-all duration-200 hover:-translate-y-px hover:bg-surface/90"
                  style={{ borderColor: "var(--border-card)" }}
                >
                  <Icon width={16} height={16} className="mt-0.5 shrink-0 text-accent/50" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
                      {f.label}
                    </p>
                    <p className="text-sm font-medium text-foreground/80">{f.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
