"use client";

import { useState } from "react";
import { Briefcase, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassCard, SectionHeader } from "../primitives";
import type { ExperienceItem } from "../data";

function ExperienceCard({
  item,
  onClick,
}: {
  item: ExperienceItem;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative w-full text-left"
    >
      <span className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-primary shadow-[var(--glow-accent)]" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
        {item.years}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground/85">{item.role}</h3>
        <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary/80">
          {item.platform}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground/55">{item.company}</p>
      {item.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/50">
          {item.description}
        </p>
      )}
    </button>
  );
}

export function ExperienceSection({ data }: { data: ExperienceItem[] }) {
  const [selected, setSelected] = useState<ExperienceItem | null>(null);
  const preview = data.slice(0, 4);
  const hasMore = data.length > 4;

  return (
    <GlassCard>
      <SectionHeader icon={<Briefcase className="size-4" />} title="Experience" />

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground/60">
          No experience added yet.
        </p>
      ) : (
        <>
          <ol className="relative space-y-6 border-l border-primary/20 pl-6">
            {preview.map((item) => (
              <li key={item.id}>
                <ExperienceCard item={item} onClick={() => setSelected(item)} />
              </li>
            ))}
          </ol>
          {hasMore && (
            <button
              onClick={() => setSelected(data[0])}
              className="profile-inset mt-5 w-full rounded-xl py-2 text-xs font-medium text-foreground/70 transition-colors hover:bg-bg-surface"
            >
              View {data.length - 4} more
            </button>
          )}
        </>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="profile-card max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
              <Briefcase className="size-4 text-primary" />
              Experience
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 py-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
                  {selected.years}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">{selected.role}</h3>
                <p className="text-sm text-muted-foreground">{selected.company}</p>
              </div>
              {selected.projectName && (
                <p className="text-sm text-foreground/80">
                  <span className="text-muted-foreground/50">Project:</span> {selected.projectName}
                </p>
              )}
              {selected.director && (
                <p className="text-sm text-foreground/80">
                  <span className="text-muted-foreground/50">Director:</span> {selected.director}
                </p>
              )}
              {selected.description && (
                <p className="text-sm leading-relaxed text-foreground/70">{selected.description}</p>
              )}
              {selected.creditUrl && (
                <a
                  href={selected.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  View credit <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GlassCard>
  );
}
