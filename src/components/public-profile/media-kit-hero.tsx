"use client";

import { useState } from "react";

interface MediaKitHeroProps {
  heroBackground?: string;
  portfolioImages: string[];
}

export function MediaKitHero({ heroBackground, portfolioImages }: MediaKitHeroProps) {
  const fallbackChain = [heroBackground, portfolioImages[0]].filter(Boolean) as string[];
  const [srcIndex, setSrcIndex] = useState(0);

  const currentSrc = srcIndex < fallbackChain.length ? fallbackChain[srcIndex] : null;

  return (
    <section className="relative w-full aspect-video overflow-hidden bg-cream-deep">
      {currentSrc ? (
        <img
          key={srcIndex}
          src={currentSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setSrcIndex((i) => i + 1)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gold-soft/40 to-cream" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60" />
    </section>
  );
}
