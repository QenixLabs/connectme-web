"use client";

import { X } from "lucide-react";

export function ViewerTopBar({
  title,
  current,
  total,
  visible,
  onClose,
}: {
  title: string;
  current: number;
  total: number;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`absolute inset-x-0 top-0 z-10 flex items-center gap-3 px-4 py-3 transition-opacity duration-300 safe-top ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
        paddingTop: "max(12px, env(safe-area-inset-top))",
      }}
    >
      <button
        onClick={onClose}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"
        aria-label="Close viewer"
      >
        <X className="size-5" />
      </button>
      <span className="min-w-0 truncate text-sm font-medium text-white">{title}</span>
      <span className="ml-auto shrink-0 text-xs text-white/60">
        {current} / {total}
      </span>
    </div>
  );
}
