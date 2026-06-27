"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

export function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <Card className="p-4 text-center gap-2 rounded-2xl border-border-subtle shadow-sm">
      <CardContent className="p-0 flex flex-col items-center gap-2">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-light">
          <Icon className="w-4 h-4 text-brand" strokeWidth={1.5} />
        </div>
        <p className="text-xl font-semibold text-text-primary leading-none">{value}</p>
        <p className="text-[11px] text-text-muted">{label}</p>
      </CardContent>
    </Card>
  );
}
