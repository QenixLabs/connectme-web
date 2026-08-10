"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-medium tracking-[0.02em] text-foreground/85 backdrop-blur-sm",
        className,
      )}
      style={{ borderColor: "oklch(1 0 0 / 0.08)", backgroundColor: "oklch(1 0 0 / 0.06)" }}
    >
      {children}
    </span>
  );
}
