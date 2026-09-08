import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value?: string;
  options: string[];
  icon?: LucideIcon;
  onSelect: (value: string) => void;
  className?: string;
};

/**
 * Find-talent filter tile — ported from talent-finder-flow's FilterSelect,
 * re-skinned with connectme-web tokens.
 */
export function FilterSelect({ label, value, options, icon: Icon, onSelect, className }: Props) {
  const active = Boolean(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "rounded-2xl bg-surface p-3 text-left ring-1 ring-border/70 transition-shadow",
          "hover:ring-primary/40 focus-visible:outline-none",
          "data-[state=open]:ring-primary/50",
          className,
        )}
        aria-label={`${label}${value ? `: ${value}` : ""}`}
      >
        <span className="flex items-start justify-between">
          {Icon && (
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
          )}
          <ChevronDown className="mt-2 size-4 text-muted-foreground" />
        </span>
        <span className="mt-2 block text-sm font-bold text-foreground">{label}</span>
        <span className={cn("block truncate text-xs font-medium", active ? "text-primary" : "text-muted-foreground")}>
          {value || "Any"}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 overflow-auto rounded-xl border-border bg-popover">
        <DropdownMenuItem onSelect={() => onSelect("")}>Any</DropdownMenuItem>
        {options.map((o) => (
          <DropdownMenuItem key={o} onSelect={() => onSelect(o)}>
            {o}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
