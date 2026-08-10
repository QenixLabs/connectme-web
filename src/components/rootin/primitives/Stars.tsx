"use client";

import { Star } from "lucide-react";

export function Stars({ value, size = 14 }: { value: number; size?: number | undefined }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={
            i < Math.round(value)
              ? "fill-gold text-gold drop-shadow-[0_0_3px_var(--gold)]"
              : "text-muted-foreground/30"
          }
        />
      ))}
    </span>
  );
}
