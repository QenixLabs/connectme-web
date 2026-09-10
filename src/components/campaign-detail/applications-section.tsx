"use client";

import Link from "next/link";
import { ChevronRight, Inbox, Loader2 } from "lucide-react";
import type { EnrichedApplication } from "@/lib/api/campaigns";
import { ApplicantCard } from "@/components/campaign-applicants/applicant-card";
import { cn } from "@/lib/utils";

export type ApplicationSegment = "all" | "shortlisted" | "accepted" | "rejected";

const PREVIEW_LIMIT = 6;

const segmentLabels: Record<ApplicationSegment, string> = {
  all: "All",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
};

const emptyMessages: Record<ApplicationSegment, string> = {
  all: "No applications yet. Share the campaign to start receiving talent.",
  shortlisted: "No shortlisted applications yet. Shortlist applicants to track your top picks.",
  accepted: "No accepted applications yet.",
  rejected: "No rejected applications.",
};

export function ApplicationsSection({
  campaignId,
  applications,
  counts,
  segment,
  onSegmentChange,
  isLoading,
  innerRef,
}: {
  campaignId: string;
  applications: EnrichedApplication[];
  counts: Record<ApplicationSegment, number>;
  segment: ApplicationSegment;
  onSegmentChange: (segment: ApplicationSegment) => void;
  isLoading: boolean;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const visible = applications.slice(0, PREVIEW_LIMIT);

  return (
    <section ref={innerRef} className="scroll-mt-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
          Applications{" "}
          <span className="text-sm font-medium text-muted-foreground">({counts.all})</span>
        </h2>
        <Link
          href={`/recruiter/campaigns/${campaignId}/applications`}
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
        >
          Manage all <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* Segmented filters */}
      <div
        role="tablist"
        aria-label="Filter applications"
        className="mt-2.5 flex overflow-x-auto rounded-lg bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {(Object.keys(segmentLabels) as ApplicationSegment[]).map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={segment === key}
            onClick={() => onSegmentChange(key)}
            className={cn(
              "min-w-0 flex-1 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              segment === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {segmentLabels[key]} ({counts[key]})
          </button>
        ))}
      </div>

      {/* Application cards */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-2.5 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center">
          <Inbox className="size-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{emptyMessages[segment]}</p>
        </div>
      ) : (
        <div className="mt-2.5 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
          {visible.map((app) => (
            <ApplicantCard
              key={app._id}
              application={app}
              stage={app.status}
              showStar={false}
            />
          ))}
        </div>
      )}

      {counts[segment] > PREVIEW_LIMIT && (
        <Link
          href={`/recruiter/campaigns/${campaignId}/applications`}
          className="mt-2.5 flex items-center justify-center gap-1 rounded-lg border border-border bg-card py-2 text-xs font-semibold text-primary hover:bg-secondary/50"
        >
          View all {counts[segment]} {segmentLabels[segment].toLowerCase()} applications
          <ChevronRight className="size-3.5" />
        </Link>
      )}
    </section>
  );
}
