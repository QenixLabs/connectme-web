"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  prominent = false,
  hover = true,
}: {
  className?: string;
  children: ReactNode;
  prominent?: boolean;
  hover?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative rounded-xl border p-4 sm:p-5 transition-all duration-300 ease-out",
        hover && "hover:-translate-y-0.5",
        className,
      )}
      style={{
        borderColor: "var(--border-card)",
        backgroundImage: prominent
          ? `var(--card-inner-highlight), var(--gradient-card-prominent)`
          : `var(--card-inner-highlight), var(--gradient-card)`,
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => {
        if (!hover) return;
        (e.currentTarget as HTMLElement).style.borderColor = "oklch(1 0 0 / 0.06)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-lift)";
      }}
      onMouseLeave={(e) => {
        if (!hover) return;
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-card)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
      }}
    >
      {children}
    </section>
  );
}
