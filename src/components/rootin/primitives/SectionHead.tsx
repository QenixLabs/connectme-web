"use client";

import type { ReactNode } from "react";

export function SectionHead({
  icon,
  title,
  action,
}: {
  icon: ReactNode;
  title: string;
  action?: string;
}) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-accent flex items-center">{icon}</span>
        <h2 className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
          {title}
        </h2>
      </div>
      {action ? (
        <button className="shrink-0 text-[11px] font-medium text-accent/70 transition-all duration-200 hover:text-accent">
          {action}
        </button>
      ) : null}
    </div>
  );
}
