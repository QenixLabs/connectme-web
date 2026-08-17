"use client";

import { useEffect, useRef } from "react";
import type { PortfolioItem } from "@/lib/types/portfolio";
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
      img.src = item.url;
      preloadedRef.current = true;
    }
  }, [preload, item]);

  if (item.type === "video") {
    return (
      <VideoSlide
        src={item.url}
        poster={item.thumbnailUrl || item.url}
        active={active}
      />
    );
  }

  return <ImageSlide src={item.url} alt={item.title} />;
}
