"use client";

import { Calendar, Eye, Globe, MoveVertical, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, SectionHead, EmptyState } from "../primitives";
import type { Fact } from "./types";

const factIcons: Record<string, React.ComponentType<{ width?: number; height?: number; className?: string }>> = {
  calendar: Calendar,
  height: MoveVertical,
  globe: Globe,
  eye: Eye,
};

export interface DetailsSectionProps {
  facts: Fact[];
  className?: string;
}

export function DetailsSection({ facts, className }: DetailsSectionProps) {
  return (
    <Card prominent className={cn("transition-all duration-300 ease-out", className)}>
      <SectionHead icon={<User width={16} height={16} />} title="Details" />
      {facts.length === 0 ? (
        <EmptyState icon={<User width={32} height={32} />} message="No details added yet." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
    </Card>
  );
}
