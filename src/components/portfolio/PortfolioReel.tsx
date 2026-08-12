"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import type { PortfolioItem } from "@/lib/types/portfolio";
import { PortfolioReelItem } from "./PortfolioReelItem";

interface PortfolioReelProps {
  items: PortfolioItem[];
  username: string;
  isOwner?: boolean;
  initialIndex?: number;
  className?: string;
  onEdit?: (item: PortfolioItem) => void;
  onToggleFeatured?: (item: PortfolioItem) => void;
  onDelete?: (item: PortfolioItem) => void;
  onShare?: (item: PortfolioItem) => void;
}

export function PortfolioReel({
  items,
  username,
  isOwner,
  initialIndex = 0,
  className,
  onEdit,
  onToggleFeatured,
  onDelete,
  onShare,
}: PortfolioReelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(
    Math.min(Math.max(initialIndex, 0), Math.max(items.length - 1, 0)),
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio
            ? current
            : prev,
        );
        if (best.intersectionRatio > 0) {
          const index = Number(best.target.getAttribute("data-index"));
          if (!Number.isNaN(index)) setActiveIndex(index);
        }
      },
      { root: container, threshold: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7] },
    );

    Array.from(container.children).forEach((child) =>
      observer.observe(child),
    );
    return () => observer.disconnect();
  }, [items]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current;
      const child = container?.children[index] as HTMLElement | undefined;
      if (container && child) {
        container.scrollTo({ top: child.offsetTop, behavior });
      }
    },
    [],
  );

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => {
      scrollToIndex(activeIndex, "auto");
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        if (activeIndex < items.length - 1) scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (activeIndex > 0) scrollToIndex(activeIndex - 1);
      }
    },
    [activeIndex, items.length, scrollToIndex],
  );

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar outline-none ${className ?? "h-[calc(100dvh-52px)]"}`}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          data-index={index}
          className="h-full w-full shrink-0 snap-start snap-always"
        >
          <PortfolioReelItem
            item={item}
            username={username}
            isActive={index === activeIndex}
            isOwner={isOwner}
            onEdit={onEdit}
            onToggleFeatured={onToggleFeatured}
            onDelete={onDelete}
            onShare={onShare}
          />
        </div>
      ))}
    </div>
  );
}
