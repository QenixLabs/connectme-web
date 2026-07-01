"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({
  label,
  value,
  onChange,
  maxLength = 6,
  disabled = false,
  className,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.replace(/\D/g, "").slice(0, maxLength).split("");

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "");
    if (!digit) return;

    const newDigits = [...digits];
    newDigits[index] = digit;
    while (newDigits.length > index + 1) newDigits.pop();

    const newValue = newDigits.join("");
    onChange(newValue);

    if (index < maxLength - 1 && digit) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, maxLength);
    onChange(pasted);
  };

  const spots = Array.from({ length: maxLength }, (_, i) => i);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-center text-xs font-medium uppercase tracking-widest text-text-muted">
          {label}
        </p>
      )}
      <div className="flex items-center justify-center gap-2.5">
        {spots.map((i) => {
          const hasValue = !!digits[i];
          return (
            <motion.input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={1}
              value={digits[i] || ""}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              disabled={disabled}
              animate={{
                borderColor: hasValue ? "var(--color-brand)" : "var(--color-border)",
                boxShadow: hasValue
                  ? "0 0 0 2px rgba(245, 158, 11, 0.15)"
                  : "0 0 0 0px transparent",
              }}
              className={cn(
                "w-12 h-14 rounded-xl border-2 bg-card text-center text-xl font-semibold text-text-primary",
                "outline-none transition-colors duration-200",
                "focus:border-brand focus:ring-2 focus:ring-brand/20",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
