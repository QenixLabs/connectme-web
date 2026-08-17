import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: string;
  href?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  href,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "border-dashed border-border/60 bg-surface/40 py-0 transition-colors hover:border-border-hover/80",
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
          <Icon className="size-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
        {action && href ? (
          <Button asChild size="sm" className="mt-5 rounded-full">
            <Link href={href}>{action}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
