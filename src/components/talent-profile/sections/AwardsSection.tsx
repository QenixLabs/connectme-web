"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Award, ExternalLink, Play } from "lucide-react";
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
        <ul className="divide-y divide-border/60">
          {data.map((a) => (
            <li
              key={a.id}
              className="py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-start gap-3">
                {a.mediaUrl ? (
                  <button type="button" aria-label={`View ${a.name} media`} onClick={() => setSelected(a)} className="relative size-[60px] shrink-0 overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <img src={getYouTubeThumbnail(a.mediaUrl) ?? a.mediaUrl} alt={`${a.name} cover`} className="size-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                    {getYouTubeEmbedUrl(a.mediaUrl) && <span className="absolute inset-0 grid place-items-center bg-black/15"><Play className="size-4 fill-white text-white drop-shadow" /></span>}
                  </button>
                ) : (
                  <button type="button" aria-label={`View ${a.name} details`} onClick={() => setSelected(a)} className="grid size-[60px] shrink-0 place-items-center rounded-xl bg-amber-50 text-[#D97706] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Award className="size-5" />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => setSelected(a)} className="block min-h-6 max-w-full break-words text-left text-[15px] font-semibold leading-snug text-foreground hover:text-brand focus-visible:outline-none focus-visible:underline">{a.name}</button>
                  {(a.issuer || a.year) && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{[a.issuer, a.year].filter(Boolean).join(" · ")}</p>}
                  {a.description && <p className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground">{a.description}</p>}
                  {a.linkUrl && <a href={a.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-brand transition-colors hover:text-brand/80 active:text-brand/70 focus-visible:outline-none focus-visible:underline">View award <ExternalLink className="size-3.5" /></a>}
                </div>
              </div>
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
              {selected.linkUrl && (
                <a
                  href={selected.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-brand hover:text-brand/80 focus-visible:outline-none focus-visible:underline"
                >
                  View award <ExternalLink className="size-4" />
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CollapsibleSection>
  );
}
