"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, ExternalLink, ArrowRight } from "lucide-react";
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
      <span className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-rootin shadow-[0_0_10px_-3px_var(--rootin-blue)]" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
        {item.years}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground/90">{item.role}</h3>
        <span className="rounded-full border border-rootin/20 bg-rootin/5 px-2 py-0.5 text-[10px] font-medium text-rootin">
          {item.platform}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground/60">{item.company}</p>
      {item.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/55">
          {item.description}
        </p>
      )}
    </button>
  );
}

export function ExperienceSection({
  data,
  isOwner = false,
}: {
  data: ExperienceItem[];
  isOwner?: boolean;
}) {
  const [selected, setSelected] = useState<ExperienceItem | null>(null);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? data : data.slice(0, 4);
  const hasMore = data.length > 4;

  return (
    <GlassCard>
      <SectionHeader
        icon={<Briefcase className="size-4" />}
        title="Experience"
        action={
          hasMore ? (showAll ? "Show Less" : "View All") : undefined
        }
        onAction={hasMore ? () => setShowAll((v) => !v) : undefined}
      />

      {data.length === 0 ? (
        <div className="py-4 text-center sm:py-5">
          <p className="text-sm text-muted-foreground/60">
            No experience added yet.
          </p>
          {isOwner && (
            <Link
              href="/talent/profile"
              className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-rootin transition-colors hover:text-rootin/80"
            >
              Add your first experience
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <ol className="relative space-y-5 border-l border-rootin/20 pl-6">
          {visible.map((item) => (
            <li key={item.id}>
              <ExperienceCard item={item} onClick={() => setSelected(item)} />
            </li>
          ))}
        </ol>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="profile-card max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
              <Briefcase className="size-4 text-rootin" />
              Experience
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 py-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
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
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-rootin hover:text-rootin/80"
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
