"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  className?: string;
}

export function OtpInput({ value, onChange, length = 6, className }: OtpInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (index: number, digit: string) => {
    const d = digit.replace(/\D/g, "");
    const next = value.split("");
    next[index] = d;
    const joined = next.join("").slice(0, length);
    onChange(joined);

    if (d && index < length - 1) {
      const el = containerRef.current?.children[index + 1] as HTMLInputElement | undefined;
      el?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      const el = containerRef.current?.children[index - 1] as HTMLInputElement | undefined;
      el?.focus();
    }
  };

  return (
    <div ref={containerRef} className={cn("flex justify-center gap-2", className)}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          value={value[i] ?? ""}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            "w-11 h-12 rounded-xl border bg-secondary/30 text-center text-lg font-semibold outline-none transition-all",
            value.length === i
              ? "border-primary ring-[3px] ring-primary/20"
              : "border-border",
          )}
        />
      ))}
    </div>
  );
}
