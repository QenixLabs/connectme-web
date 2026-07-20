"use client";

import { motion } from "motion/react";
import { Film, Award, Calendar, Monitor } from "lucide-react";

interface CreditItem {
  project_name?: string;
  role_played?: string;
  platform?: string;
  year?: number;
  is_verified?: boolean;
}

interface PortfolioExperienceProps {
  credits: CreditItem[];
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-luxe p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream">
        <Film className="h-6 w-6 text-ink-muted" strokeWidth={1.2} />
      </div>
      <p className="mt-4 text-[14px] font-medium text-ink">No credits added yet</p>
      <p className="mt-1 text-[12.5px] text-ink-muted leading-relaxed max-w-xs mx-auto">
        Past projects, filmography, and professional credits will appear here.
      </p>
    </div>
  );
}

function CreditCard({ credit, index }: { credit: CreditItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="relative rounded-2xl bg-card border border-border/60 shadow-luxe p-4 hover:shadow-luxe-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-gold" />
      <div className="pl-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-serif text-[15px] font-semibold text-ink leading-snug">
            {credit.project_name || "Untitled Project"}
          </h4>
          {credit.is_verified && (
            <Award className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
          )}
        </div>
        {credit.role_played && (
          <p className="mt-1 text-[13px] font-medium text-ink-soft">{credit.role_played}</p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {credit.platform && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-border px-2 py-0.5 text-[10.5px] font-medium text-ink-muted">
              <Monitor className="h-2.5 w-2.5" strokeWidth={1.5} />
              {credit.platform}
            </span>
          )}
          {credit.year && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-border px-2 py-0.5 text-[10.5px] font-medium text-ink-muted">
              <Calendar className="h-2.5 w-2.5" strokeWidth={1.5} />
              {credit.year}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function PortfolioExperience({ credits }: PortfolioExperienceProps) {
  if (credits.length === 0) {
    return (
      <section className="px-4 mt-5">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10">
            <Award className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-ink tracking-tight">
            Experience & Credits
          </h3>
        </div>
        <EmptyState />
      </section>
    );
  }

  return (
    <section className="px-4 mt-5">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10">
            <Award className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-ink tracking-tight">
            Experience & Credits
          </h3>
        </div>
        <span className="text-[11px] font-medium text-ink-muted bg-muted px-2.5 py-1 rounded-full tabular-nums">
          {credits.length} credit{credits.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {credits.map((credit, i) => (
          <CreditCard key={i} credit={credit} index={i} />
        ))}
      </div>
    </section>
  );
}
