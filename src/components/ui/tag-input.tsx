"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  normalizeFromSuggestions?: boolean;
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
  normalizeFromSuggestions = false,
  error,
  containerClassName,
  disabled,
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions =
    suggestions?.filter(
      (s) =>
        draft.trim().length > 0 &&
        s.toLowerCase().includes(draft.toLowerCase()) &&
        !value.some((v) => v.toLowerCase() === s.toLowerCase()),
    ) ?? [];

  const findCanonical = useCallback(
    (raw: string) => {
      if (!normalizeFromSuggestions || !suggestions) return null;
      return suggestions.find((s) => s.toLowerCase() === raw.toLowerCase()) ?? null;
    },
    [normalizeFromSuggestions, suggestions],
  );

  const addTag = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      const canonical = findCanonical(trimmed) ?? trimmed;
      if (value.some((v) => v.toLowerCase() === canonical.toLowerCase())) {
        setDraft("");
        setShowDropdown(false);
        setHighlightedIdx(-1);
        return;
      }
      onChange([...value, canonical]);
      setDraft("");
      setShowDropdown(false);
      setHighlightedIdx(-1);
    },
    [value, onChange, findCanonical],
  );

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (filteredSuggestions.length > 0 && showDropdown) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIdx((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIdx((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIdx >= 0) {
          addTag(filteredSuggestions[highlightedIdx]);
        } else {
          addTag(draft);
        }
        return;
      }
      if (e.key === "Escape") {
        setShowDropdown(false);
        setHighlightedIdx(-1);
        return;
      }
    }

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault();
      removeTag(value.length - 1);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (draft.trim()) addTag(draft);
      setShowDropdown(false);
      setHighlightedIdx(-1);
    }, 150);
  };

  useEffect(() => {
    if (draft.trim().length > 0 && filteredSuggestions.length > 0) {
      setShowDropdown(true);
      setHighlightedIdx(-1);
    } else {
      setShowDropdown(false);
      setHighlightedIdx(-1);
    }
  }, [draft, filteredSuggestions.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setHighlightedIdx(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn(containerClassName)}>
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div
        className={cn(
          "min-h-11 w-full px-3 py-2 rounded-lg border bg-page text-sm flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-brand-focus focus-within:bg-card transition-all relative",
          error ? "border-error-border-strong" : "border-border",
          disabled && "opacity-50 cursor-not-allowed",
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
        <div className="relative flex-1 min-w-[120px]">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => {
              if (draft.trim().length > 0 && filteredSuggestions.length > 0) {
                setShowDropdown(true);
              }
            }}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-placeholder"
          />
          {showDropdown && filteredSuggestions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-lg z-50 py-1"
            >
              {filteredSuggestions.map((s, idx) => (
                <button
                  key={s}
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm transition-colors",
                    idx === highlightedIdx
                      ? "bg-brand-soft text-brand-active"
                      : "text-text-primary hover:bg-cream",
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(s);
                  }}
                  onMouseEnter={() => setHighlightedIdx(idx)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
