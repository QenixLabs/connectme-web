import { cn } from "@/lib/utils";

export function PortfolioEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
