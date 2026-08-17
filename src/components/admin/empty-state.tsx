import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Card className="rounded-2xl border-border bg-card py-14 text-center">
      <CardContent className="p-0">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
