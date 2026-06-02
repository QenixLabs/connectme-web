"use client";

import { Download, Camera, Sparkles } from "lucide-react";

interface MediaKitIntroProps {
  name: string;
  imageCount: number;
  videoCount: number;
  onDownloadAll?: () => void;
}

export function MediaKitIntro({ name, imageCount, videoCount, onDownloadAll }: MediaKitIntroProps) {
  const total = imageCount + videoCount;

  return (
    <section className="px-4 pt-5">
      <div className="rounded-2xl bg-card border border-border/60 shadow-luxe px-5 py-4">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="h-3 w-3 text-gold" />
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-gold">Curated</span>
        </div>
        <h1 className="font-serif text-[22px] font-semibold text-ink leading-tight">Press & Portfolio</h1>
        <p className="mt-1 text-[12.5px] text-ink-muted">
          {imageCount} photo{imageCount !== 1 ? "s" : ""} · {videoCount} video{videoCount !== 1 ? "s" : ""}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={onDownloadAll}
            className="flex-1 h-10 rounded-xl bg-gradient-to-b from-[oklch(0.78_0.13_80)] to-[oklch(0.68_0.13_78)] text-white text-[12.5px] font-medium flex items-center justify-center gap-2 shadow-[0_8px_24px_-12px_oklch(0.74_0.13_80/0.7)]"
          >
            <Download className="h-3.5 w-3.5" />
            Download All
          </button>
          <div className="h-10 px-4 rounded-xl bg-cream border border-border text-ink-soft text-[12.5px] font-medium flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 text-gold" />
            {total} item{total !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </section>
  );
}
