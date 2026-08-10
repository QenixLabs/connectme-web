import { MoreVertical } from "lucide-react";
import type { EnrichedApplication } from "@/lib/api/campaigns";
import { ApplicantCard } from "./applicant-card";
import { cn } from "@/lib/utils";

const accents: Record<string, { bar: string; text: string }> = {
  applied: { bar: "bg-[var(--info)]", text: "text-[var(--info)]" },
  shortlisted: { bar: "bg-primary", text: "text-primary" },
  review: { bar: "bg-[var(--amber)]", text: "text-[var(--amber)]" },
  accepted: { bar: "bg-[var(--success)]", text: "text-[var(--success)]" },
  rejected: { bar: "bg-[var(--destructive)]", text: "text-[var(--destructive)]" },
};

export interface Stage {
  key: string;
  title: string;
  count: number;
  subtitle?: string;
  applicants: EnrichedApplication[];
  more: number;
}

interface StageColumnProps {
  stage: Stage;
}

export function StageColumn({ stage }: StageColumnProps) {
  const a = accents[stage.key] ?? accents.applied;

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card p-3">
      <header className="flex items-start justify-between gap-2 px-1">
        <div className="flex gap-2.5">
          <span className={cn("mt-0.5 h-5 w-1 rounded-full", a.bar)} />
          <div>
            <h2 className="text-sm font-semibold">
              {stage.title}{" "}
              <span className="text-muted-foreground">({stage.count})</span>
            </h2>
            {stage.subtitle && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {stage.subtitle}
              </p>
            )}
          </div>
        </div>
        <button className="text-muted-foreground transition-colors hover:text-foreground">
          <MoreVertical className="h-4 w-4" />
        </button>
      </header>

      <div className="mt-3 flex flex-col gap-3">
        {stage.applicants.map((app) => (
          <ApplicantCard
            key={app._id}
            application={app}
            stage={stage.key}
          />
        ))}
      </div>

      {stage.more > 0 && (
        <button
          className={cn("mt-3 py-1 text-xs font-medium", a.text)}
        >
          + {stage.more} more
        </button>
      )}
    </section>
  );
}
