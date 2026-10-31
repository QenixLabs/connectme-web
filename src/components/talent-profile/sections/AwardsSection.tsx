"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Award, ChevronRight, Play } from "lucide-react";
import { CollapsibleSection } from "../primitives";
import type { AwardItem } from "../data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/hooks/use-portfolio";

export function AwardsSection({
  data,
  collapsible = false,
  action,
  onAction,
}: {
  data: AwardItem[];
  collapsible?: boolean;
  action?: string;
  onAction?: () => void;
}) {
  const [selected, setSelected] = useState<AwardItem | null>(null);

  return (
    <CollapsibleSection
      icon={<Award className="size-4" />}
      title="Awards"
      action={action}
      onAction={onAction}
      collapsible={collapsible && data.length > 0}
    >
      {data.length === 0 ? (
        <div className="flex flex-col items-center py-2 text-center">
          <span className="grid size-10 place-items-center rounded-2xl bg-amber-50 text-[#D97706]">
            <Award className="size-4.5" />
          </span>
          <p className="mt-1.5 text-sm font-semibold text-foreground/70">The spotlight is ready.</p>
          <p className="mt-0.5 text-xs text-muted-foreground/60">Awards and recognitions will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {data.map((a) => (
            <li
              key={a.id}
              className="border-b border-border/60 pb-2 last:border-0 last:pb-0"
            >
              <button
                type="button"
                onClick={() => setSelected(a)}
                className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-amber-50 text-warning">
                  <Award className="size-4" />
                  {a.mediaUrl && (
                    <img
                      src={getYouTubeThumbnail(a.mediaUrl) ?? a.mediaUrl}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  {a.mediaUrl && getYouTubeEmbedUrl(a.mediaUrl) && (
                    <Play className="absolute size-4 fill-white text-white drop-shadow" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-bold text-foreground">{a.name}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">{a.issuer}</span>
                </span>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90svh] max-w-xl overflow-y-auto rounded-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-left">{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected?.mediaUrl && (
            <div className="overflow-hidden rounded-xl bg-black">
              {getYouTubeEmbedUrl(selected.mediaUrl) ? (
                <iframe
                  src={`${getYouTubeEmbedUrl(selected.mediaUrl)}?autoplay=1&rel=0`}
                  title={`${selected.name} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full"
                />
              ) : (
                <img src={selected.mediaUrl} alt={selected.name} className="max-h-[60svh] w-full object-contain" />
              )}
            </div>
          )}
          {selected && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{selected.issuer}</p>
              {selected.description && (
                <p className="whitespace-pre-wrap pt-2 text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CollapsibleSection>
  );
}
