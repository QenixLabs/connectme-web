"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  error?: boolean;
  containerClassName?: string;
  disabled?: boolean;
}

export function TagInput({
  label,
  value,
  onChange,
  placeholder = "Type and press Enter",
  suggestions,
  error,
  containerClassName,
  disabled,
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const datalistId = label ? `${label.replace(/\s+/g, "-").toLowerCase()}-suggestions` : undefined;

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (value.includes(tag)) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault();
      removeTag(value.length - 1);
    }
  };

  return (
    <div className={cn(containerClassName)}>
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div
        className={cn(
          "min-h-11 w-full px-3 py-2 rounded-lg border bg-page text-sm flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-brand-focus focus-within:bg-card transition-all",
          error ? "border-error-border-strong" : "border-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {value.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-soft text-brand-active rounded-md text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              disabled={disabled}
              className="hover:text-brand-hover"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" strokeWidth={2} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && addTag(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
          list={datalistId}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-text-primary placeholder:text-text-placeholder"
        />
        {suggestions && datalistId && (
          <datalist id={datalistId}>
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
}
