"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ArrowRight, MapPin } from "lucide-react";
import type { PublicCampaign } from "@/lib/api";

interface ActiveJobsSectionProps {
  jobs: PublicCampaign[];
  total: number;
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function ActiveJobsSection({ jobs, total }: ActiveJobsSectionProps) {
  if (jobs.length === 0) {
    return (
      <Card className="border-border p-5 shadow-card">
        <h2 className="mb-4 text-base font-bold">Active Jobs</h2>
        <p className="text-sm text-muted-foreground">No active jobs at the moment.</p>
      </Card>
    );
  }

  return (
    <Card className="border-border p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">Active Jobs</h2>
        {total > jobs.length && (
          <span className="text-sm font-semibold text-amber">
            {total} total
          </span>
        )}
      </div>
      <ul className="space-y-3">
        {jobs.map((j) => (
          <li
            key={j._id}
            className="flex items-start gap-3 rounded-lg border border-border p-3 transition hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-soft text-amber">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold">{j.name}</div>
                {j.role_type && (
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-amber-soft px-2 py-0 text-[10px] font-semibold text-amber-foreground"
                  >
                    {j.role_type}
                  </Badge>
                )}
              </div>
              {j.location?.city && (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {[j.location.city, j.location.state].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
            <div className="shrink-0 text-xs text-muted-foreground">
              {formatTimeAgo(j.created_at)}
            </div>
          </li>
        ))}
      </ul>
      {total > jobs.length && (
        <button className="mt-4 flex w-full items-center justify-between rounded-lg text-sm font-semibold text-amber hover:underline">
          Explore all open positions
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </Card>
  );
}
