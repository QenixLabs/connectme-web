"use client";

import type { ReactNode } from "react";

export function EmptyState({
  icon,
  message,
}: {
  icon: ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center transition-all duration-300 ease-out">
      <span className="text-muted-foreground/25">{icon}</span>
      <p className="text-sm text-muted-foreground/40">{message}</p>
    </div>
  );
}
