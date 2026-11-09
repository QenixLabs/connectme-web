"use client";

import React from "react";
import { ImagePlus, UserRound, type LucideIcon } from "lucide-react";

interface ImagePlaceholderProps {
  label: string;
  shape?: "rect" | "circle";
  icon?: LucideIcon;
  className?: string;
}

/**
 * Text and icon placeholder used wherever provider mockups show photos/visuals.
 * Ensures an appealing, high-finish UI without requiring heavy image assets.
 */
export function ImagePlaceholder({
  label,
  shape = "rect",
  icon: CustomIcon,
  className = "",
}: ImagePlaceholderProps) {
  const IconComponent = CustomIcon || (shape === "circle" ? UserRound : ImagePlus);

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex flex-col items-center justify-center gap-1.5 overflow-hidden border-[1.5px] border-dashed border-[#8738FF]/35 bg-[#8738FF]/[0.04] p-2 text-center text-[#7885A3] transition-all hover:border-[#8738FF]/55 hover:bg-[#8738FF]/[0.08] dark:border-white/20 dark:bg-white/[0.04] dark:text-white/70 ${
        shape === "circle" ? "rounded-full" : "rounded-2xl"
      } ${className}`}
    >
      <IconComponent className="size-5 shrink-0 opacity-70" />
      <span className="max-w-[90%] select-none text-[10px] font-bold uppercase leading-tight tracking-wider text-[#4E5971] dark:text-white/80">
        {label}
      </span>
    </div>
  );
}
