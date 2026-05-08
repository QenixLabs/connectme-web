import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface ErrorBannerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "surface";
}

export function ErrorBanner({
  children,
  className,
  variant = "default",
}: ErrorBannerProps) {
  const styles = {
    default: "bg-error-light border-error-muted text-error-hover",
    surface: "bg-error-surface border-error-border text-error-text",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm",
        styles[variant],
        className
      )}
    >
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
      {children}
    </div>
  );
}
