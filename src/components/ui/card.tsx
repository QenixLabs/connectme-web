import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  progress?: number;
}

export function Card({ children, className, progress }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border shadow-sm overflow-hidden",
        className
      )}
    >
      {progress !== undefined && (
        <div className="h-1 w-full bg-muted-bg">
          <div
            className="h-full bg-gradient-to-r from-brand to-brand-light transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
