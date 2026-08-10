"use client";

import Image from "next/image";
import { Bookmark, ImageIcon, Play } from "lucide-react";

export type PortfolioItem = {
  index: number;
  total: number;
  title: string;
  description: string;
  type: "image" | "video";
  src: string;
};

export function PortfolioCard({ item, onClick }: { item: PortfolioItem; onClick?: () => void }) {
  const isVideo = item.type === "video";
  return (
    <article
      onClick={onClick}
      className={`group flex overflow-hidden rounded-xl border border-border bg-card shadow-card transition-colors hover:border-primary/50 sm:block ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="relative w-32 shrink-0 sm:w-auto">
        <Image
          src={item.src}
          alt={item.title}
          loading="lazy"
          width={640}
          height={512}
          className="h-full w-full object-cover sm:aspect-[4/3] sm:h-auto"
        />
        <span
          className={`absolute left-2 top-2 grid size-7 place-items-center rounded-lg sm:left-3 sm:top-3 sm:size-8 ${
            isVideo ? "bg-accent text-accent-foreground" : "bg-accent/60 text-accent-foreground"
          }`}
        >
          {isVideo ? (
            <Play className="size-3.5 fill-current sm:size-4" />
          ) : (
            <ImageIcon className="size-3.5 sm:size-4" strokeWidth={2} />
          )}
        </span>
      </div>

      <div className="min-w-0 flex-1 p-3.5 sm:p-4">
        <p className="text-xs text-muted-foreground">
          {item.index} / {item.total}
        </p>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold leading-snug text-foreground">{item.title}</h3>
          <button
            aria-label={`Save ${item.title}`}
            className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
          >
            <Bookmark className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
    </article>
  );
}
