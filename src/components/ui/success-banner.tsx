import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface SuccessBannerProps {
  children: React.ReactNode;
  className?: string;
}

export function SuccessBanner({ children, className }: SuccessBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 bg-success-light border border-success-muted text-success-text rounded-lg px-4 py-3 text-sm",
        className
      )}
    >
      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
      {children}
    </div>
  );
}
