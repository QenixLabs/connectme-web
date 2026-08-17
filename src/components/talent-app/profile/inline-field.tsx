"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface InlineFieldProps {
  label?: string;
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  inputType?: string;
  className?: string;
}

export function InlineField({
  label,
  value,
  onSave,
  multiline,
  placeholder,
  inputType = "text",
  className,
}: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const startEditing = () => {
    setDraft(value);
    setEditing(true);
  };

  const commit = () => {
    onSave(draft.trim().slice(0, multiline ? 2000 : 200));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={cn("w-full", className)}>
        {label && (
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            {label}
          </p>
        )}
        {multiline ? (
          <Textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            rows={4}
            maxLength={2000}
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            className="resize-none"
          />
        ) : (
          <Input
            ref={ref as React.RefObject<HTMLInputElement>}
            type={inputType}
            maxLength={200}
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        )}
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={commit} className="h-8 gap-1.5">
            <Check className="size-3.5" /> Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing(false)}
            className="h-8 gap-1.5"
          >
            <X className="size-3.5" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={startEditing}
      className={cn(
        "group w-full rounded-xl border border-transparent p-2 text-left transition-colors hover:border-border hover:bg-muted/40",
        className,
      )}
      aria-label={`Edit ${label ?? "field"}`}
    >
      {label && (
        <p className="mb-0.5 text-xs font-medium text-muted-foreground">
          {label}
        </p>
      )}
      <span className="flex items-start gap-2">
        <span
          className={cn(
            "min-w-0 flex-1 whitespace-pre-line text-sm",
            value ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {value || placeholder || "Add"}
        </span>
        <Pencil className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
    </button>
  );
}
