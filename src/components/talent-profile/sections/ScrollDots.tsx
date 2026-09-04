"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

export function ScrollDots({
  scrollRef,
  count,
}: {
  scrollRef: RefObject<HTMLDivElement | null>;
  count: number;
}) {
  const [active, setActive] = useState(0);
  const [overflows, setOverflows] = useState(false);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setOverflows(el.scrollWidth - el.clientWidth > 1);
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const c = child as HTMLElement;
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || count <= 1) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    Array.from(el.children).forEach((child) => ro.observe(child));
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [scrollRef, count, measure]);

  const jumpTo = (i: number) => {
    const el = scrollRef.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (!el || !child) return;
    el.scrollTo({
      left: child.offsetLeft - (el.clientWidth - child.clientWidth) / 2,
      behavior: "smooth",
    });
  };

  // Hidden when the row fits without scrolling (or has a single item)
  if (count <= 1 || !overflows) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 pt-3">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to item ${i + 1}`}
          onClick={() => jumpTo(i)}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === active
              ? "w-4 bg-brand"
              : "w-1.5 bg-border hover:bg-muted-foreground/50",
          )}
        />
      ))}
    </div>
  );
}
