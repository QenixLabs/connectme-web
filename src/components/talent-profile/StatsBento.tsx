"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TalentProfile, Testimonial } from "@/lib/api/talent";
import { computeRating } from "./data";

function Metric({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone: "rootin" | "success" | "gold";
}) {
  return (
    <div className="profile-stat rounded-2xl px-2 py-3.5 text-center transition-all duration-200 hover:border-border-hover sm:px-3 sm:py-4">
      <p
        className={cn(
          "flex items-baseline justify-center gap-1 text-[26px] font-bold leading-none tracking-tight sm:text-3xl",
          tone === "rootin" && "text-rootin",
          tone === "success" && "text-success",
          tone === "gold" && "text-gold",
        )}
      >
        {value}
        {tone === "gold" && <Star className="size-4 self-center fill-gold text-gold" />}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 min-h-[14px] text-[10px] text-muted-foreground/60">
        {sub ?? ""}
      </p>
    </div>
  );
}

export function StatsBento({
  profile,
  testimonials,
}: {
  profile: TalentProfile;
  testimonials: Testimonial[];
}) {
  const trustScore = profile.trust_score;
  const responseRate = profile.response_rate;
  const responseTime = profile.response_time;
  const { average, count } = computeRating(testimonials);

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Metric
        label="RootScore"
        value={trustScore != null && trustScore > 0 ? trustScore : "—"}
        sub={trustScore != null && trustScore > 0 ? "Trust score" : "Not scored yet"}
        tone="rootin"
      />
      <Metric
        label="Response Rate"
        value={responseRate != null ? `${responseRate}%` : "—"}
        sub={
          responseRate != null
            ? responseTime
              ? `Responds in ${responseTime}`
              : "Avg. reply time"
            : "Not shared"
        }
        tone="success"
      />
      <Metric
        label="Rating"
        value={average > 0 ? average.toFixed(1) : "—"}
        sub={count > 0 ? `${count} review${count === 1 ? "" : "s"}` : "No reviews yet"}
        tone="gold"
      />
    </div>
  );
}
