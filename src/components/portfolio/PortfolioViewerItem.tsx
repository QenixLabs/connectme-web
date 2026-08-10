"use client";

import { useEffect, useRef } from "react";
import type { PortfolioItem } from "./PortfolioCard";
import { ImageSlide } from "./ImageSlide";
import { VideoSlide } from "./VideoSlide";

export function PortfolioViewerItem({
  item,
  active,
  preload,
}: {
  item: PortfolioItem;
  active: boolean;
  preload: boolean;
}) {
  const preloadedRef = useRef(false);

  useEffect(() => {
    if (preload && !preloadedRef.current && item.type === "image") {
      const img = new Image();
      img.src = item.src;
      preloadedRef.current = true;
    }
  }, [preload, item]);

  if (item.type === "video") {
    return (
      <VideoSlide
        src={item.src}
        poster={item.src}
        active={active}
      />
    );
  }

  return <ImageSlide src={item.src} alt={item.title} />;
}
