"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BriefcaseBusiness,
  Clapperboard,
  ExternalLink,
  Megaphone,
  Music2,
  Play,
  Theater,
  Trophy,
  Tv,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/hooks/use-portfolio";
import { CollapsibleSection } from "../primitives";
import type { ExperienceItem } from "../data";

function getCategoryIcon(platform?: string, size = "size-5"): ReactNode {
  const category = platform?.toLowerCase() ?? "";
  if (/music\s*video/.test(category) || /music|song|album/.test(category)) {
    return <Music2 aria-hidden="true" className={`${size} stroke-[1.75]`} />;
  }
  if (/advert|commercial|\bad\b/.test(category)) {
    return <Megaphone aria-hidden="true" className={`${size} stroke-[1.75]`} />;
  }
  if (/theatre|theater|stage/.test(category)) {
    return <Theater aria-hidden="true" className={`${size} stroke-[1.75]`} />;
  }
  if (/award|recognition/.test(category)) {
    return <Trophy aria-hidden="true" className={`${size} stroke-[1.75]`} />;
  }
  if (/series|television|\btv\b|web show/.test(category)) {
    return <Tv aria-hidden="true" className={`${size} stroke-[1.75]`} />;
  }
  if (/film|movie|cinema/.test(category)) {
    return <Clapperboard aria-hidden="true" className={`${size} stroke-[1.75]`} />;
  }
  return (
    <BriefcaseBusiness
      aria-hidden="true"
      className={`${size} stroke-[1.75]`}
    />
  );
}

function getMediaSource(mediaUrl?: string): string | undefined {
  const value = mediaUrl?.trim();
  if (!value) return undefined;
  const youtubeThumbnail = getYouTubeThumbnail(value);
  if (youtubeThumbnail) return youtubeThumbnail;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;

    return url.toString();
  } catch {
    return undefined;
  }
}

function CreditMedia({
  item,
  className,
}: {
  item: ExperienceItem;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = getMediaSource(item.mediaUrl);
  const isYouTube = Boolean(item.mediaUrl && getYouTubeEmbedUrl(item.mediaUrl));
  const alt = `${item.projectName || "Project"}${item.platform ? ` ${item.platform}` : ""} media`;

  if (src && !failed) {
    return (
      <span className={`${className} relative inline-block shrink-0 overflow-hidden rounded-xl`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 640px) 64px, 60px"
          unoptimized
          loading="lazy"
          onError={() => setFailed(true)}
          className="object-cover"
        />
        {isYouTube && (
          <span className="absolute inset-0 grid place-items-center bg-black/10 text-white">
            <Play aria-hidden="true" className="size-6 fill-current drop-shadow" />
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${className} grid shrink-0 place-items-center rounded-xl bg-brand-soft text-brand`}
    >
      {getCategoryIcon(item.platform)}
    </span>
  );
}

function CreditCard({
  item,
  onClick,
}: {
  item: ExperienceItem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 items-start gap-3 rounded-xl px-1 py-2 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CreditMedia item={item} className="size-[60px] sm:size-16" />

      <span className="min-w-0 flex-1">
        {item.year && (
          <span className="block text-[10px] font-medium tabular-nums text-muted-foreground">
            {item.year}
          </span>
        )}
        <span className="mt-0.5 block break-words text-sm font-semibold leading-snug text-foreground">
          {item.projectName || "Untitled project"}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {item.platform && (
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium leading-tight text-foreground/75">
              {getCategoryIcon(item.platform, "size-3")}
              <span className="break-words">{item.platform}</span>
            </span>
          )}
          {item.role && (
            <span className="max-w-full break-words rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium leading-tight text-brand">
              {item.role}
            </span>
          )}
        </span>
        {item.director && (
          <span className="mt-1.5 flex min-w-0 items-start gap-1 text-xs text-muted-foreground">
            <UserRound aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
            <span className="break-words">{item.director}</span>
          </span>
        )}
        {item.description && (
          <span className="mt-1 block line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </span>
        )}
      </span>
    </button>
  );
}

export function CreditsSection({
  data,
  onViewAll,
  showAllInitially = false,
  showViewAll = true,
}: {
  data: ExperienceItem[];
  onViewAll?: () => void;
  showAllInitially?: boolean;
  showViewAll?: boolean;
}) {
  const [selected, setSelected] = useState<ExperienceItem | null>(null);
  const [showAll, setShowAll] = useState(showAllInitially);
  const visible = showAll ? data : data.slice(0, 4);
  const hasMore = data.length > 4;
  const viewAllAction = hasMore && showViewAll
    ? showAll && !onViewAll
      ? "Show Less"
      : "View All"
    : undefined;

  return (
    <CollapsibleSection
      icon={<Clapperboard className="size-4" />}
      title="Credits"
      action={viewAllAction}
      onAction={
        hasMore
          ? onViewAll ?? (() => setShowAll((value) => !value))
          : undefined
      }
    >
      {data.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No credits added yet.
        </p>
      ) : (
        <div className="divide-y divide-border/60">
          {visible.map((item) => (
            <CreditCard
              key={item.id}
              item={item}
              onClick={() => setSelected(item)}
            />
          ))}
        </div>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Clapperboard aria-hidden="true" className="size-4 text-brand" />
              Credit details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              {selected.mediaUrl && (
                <div className="overflow-hidden rounded-xl bg-black">
                  {getYouTubeEmbedUrl(selected.mediaUrl) ? (
                    <iframe
                      src={`${getYouTubeEmbedUrl(selected.mediaUrl)}?autoplay=1&rel=0`}
                      title={`${selected.projectName || "Credit"} video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="aspect-video w-full"
                    />
                  ) : /\.(?:mp4|webm|mov)(?:[?#].*)?$/i.test(selected.mediaUrl) ? (
                    <video src={selected.mediaUrl} controls className="max-h-[60svh] w-full" />
                  ) : (
                    <CreditMedia item={selected} className="h-52 w-full" />
                  )}
                </div>
              )}
              <div className="min-w-0">
                {selected.year && (
                  <p className="text-xs font-medium tabular-nums text-muted-foreground">
                    {selected.year}
                  </p>
                )}
                <h3 className="mt-1 break-words text-lg font-semibold text-foreground">
                  {selected.projectName || "Untitled project"}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.platform && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground/75">
                      {selected.platform}
                    </span>
                  )}
                  {selected.role && (
                    <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
                      {selected.role}
                    </span>
                  )}
                </div>
              </div>
              {selected.director && (
                <p className="break-words text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/75">With: </span>
                  {selected.director}
                </p>
              )}
              {selected.description && (
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/75">
                  {selected.description}
                </p>
              )}
              {selected.creditUrl && (
                <a
                  href={selected.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand/80"
                >
                  View credit <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CollapsibleSection>
  );
}
