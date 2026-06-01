"use client";

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

export function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl p-4 text-center border border-border-subtle shadow-sm">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-light mb-2">
        <Icon className="w-4 h-4 text-brand" strokeWidth={1.5} />
      </div>
      <p className="text-xl font-semibold text-text-primary leading-none">{value}</p>
      <p className="text-[11px] text-text-muted mt-1.5">{label}</p>
    </div>
  );
}
