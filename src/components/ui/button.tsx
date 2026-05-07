import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "outline";
  isLoading?: boolean;
  loadingLabel?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  isLoading,
  loadingLabel,
  children,
  className,
  ...props
}: ButtonProps) {
  const base =
    "h-11 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary: "bg-brand text-on-brand hover:bg-brand-hover",
    secondary:
      "border border-border text-text-secondary hover:bg-card-hover",
    dark: "bg-surface-dark text-on-surface-dark hover:bg-surface-darker",
    outline:
      "border border-border text-text-primary hover:bg-page",
  };

  return (
    <button
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {isLoading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
