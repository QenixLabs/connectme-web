"use client";

import { Check, ChevronDown, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type VerificationTypeDropdownProps = {
  id?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
};

export function VerificationTypeDropdown({
  id,
  value,
  options,
  onChange,
  className,
}: VerificationTypeDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={id}
        className={cn(
          "flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 text-left text-sm font-semibold text-foreground shadow-sm outline-none transition hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/25",
          className,
        )}
        aria-label="Select document type"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <FileText className="size-4 shrink-0 text-primary" />
          <span className="truncate">{value}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0 rounded-xl p-1.5">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => onChange(option)}
            className="min-h-10 rounded-lg px-3 text-sm font-medium"
          >
            <span className="flex-1">{option}</span>
            {option === value && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
