"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistRowProps {
  label: string;
  className?: string;
}

export function ChecklistRow({ label, className }: ChecklistRowProps) {
  return (
    <li className={cn("flex items-start gap-2.5 py-1.5", className)}>
      <Check
        size={16}
        className="mt-0.5 shrink-0 text-msg-olive"
        strokeWidth={2.5}
      />
      <span className="text-[14px] leading-snug text-ink-soft">{label}</span>
    </li>
  );
}
