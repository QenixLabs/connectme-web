"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface PortfolioHeroImmersiveProps {
  heroBackground?: string;
  portfolioImages: string[];
}

export function PortfolioHeroImmersive({
  heroBackground,
  portfolioImages,
}: PortfolioHeroImmersiveProps) {
  const fallbackChain = [heroBackground, ...portfolioImages].filter(Boolean) as string[];
  const [srcIndex, setSrcIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const currentSrc = srcIndex < fallbackChain.length ? fallbackChain[srcIndex] : null;

  useEffect(() => {
    setSrcIndex(0);
    setImgLoaded(false);
  }, [heroBackground]);

  return (
    <section className="relative w-full min-h-[55vh] max-h-[620px] overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950">
      {currentSrc && (
        <motion.img
          key={currentSrc}
          src={currentSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1 }}
          animate={imgLoaded ? { scale: 1.08 } : { scale: 1 }}
          transition={{ duration: 20, ease: "easeOut" }}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setSrcIndex((i) => i + 1);
            setImgLoaded(false);
          }}
          style={
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? { animation: "none" }
              : undefined
          }
        />
      )}

      {!currentSrc && (
        <div className="absolute inset-0 bg-gradient-to-br from-gold-soft/20 via-neutral-900/80 to-cream/10" />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-background pointer-events-none" />
    </section>
  );
}
