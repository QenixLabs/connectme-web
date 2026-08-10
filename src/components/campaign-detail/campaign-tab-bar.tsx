"use client";

import Link from "next/link";
import {
  CalendarDays,
  Download,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  count: number | null;
  href?: string;
}

export function CampaignTabBar({
  tabs,
  activeTab,
  campaignId,
}: {
  tabs: Tab[];
  activeTab: string;
  campaignId: string;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-5">
      <div className="-mx-1 flex min-w-0 gap-1 overflow-x-auto px-1 no-scrollbar">
        {tabs.map((t) => {
          const active = t.label === activeTab;
          const content = (
            <button
              key={t.label}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-3 pb-3 pt-2 text-sm transition-colors",
                active
                  ? "border-accent font-semibold text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {t.count !== null && (
                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[11px] text-foreground/70">
                  {t.count}
                </span>
              )}
            </button>
          );

          if (t.href) {
            return (
              <Link key={t.label} href={`/recruiter/campaigns/${campaignId}${t.href}`}>
                {content}
              </Link>
            );
          }
          return content;
        })}
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-lg border-border bg-secondary/40 text-sm hover:bg-secondary"
        >
          <CalendarDays className="size-4 text-muted-foreground" />
          <span className="hidden sm:inline">Date Range</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-lg border-border bg-secondary/40 text-sm hover:bg-secondary"
        >
          <Download className="size-4" /> Export
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </div>
    </section>
  );
}
