import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface VerifiedBadgeProps {
  label: string;
  className?: string;
  size?: "sm" | "md";
}

export function VerifiedBadge({
  label,
  className,
  size = "sm",
}: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 bg-success-light border border-success-muted rounded-full",
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
    >
      <Check
        className={cn(
          size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5",
          "text-success-hover"
        )}
        strokeWidth={1.5}
      />
      <span className="font-medium text-success-text">{label}</span>
    </span>
  );
}
