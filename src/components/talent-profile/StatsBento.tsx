"use client";

import { ShieldCheck, TrendingUp, Star, Briefcase } from "lucide-react";
import type { TalentProfile, Testimonial } from "@/lib/api/talent";
import { computeRating } from "./data";

export function StatsBento({
  profile,
  testimonials,
}: {
  profile: TalentProfile;
  testimonials: Testimonial[];
}) {
  const trustScore = profile.trust_score;
  const responseRate = profile.response_rate;
  const { average, count } = computeRating(testimonials);
  const projects = profile.analytics?.shortlist_count ?? 0;

  const stats = [
    {
      icon: ShieldCheck,
      value: trustScore != null && trustScore > 0 ? String(trustScore) : "\u2014",
      label: "RootScore",
      sub:
        trustScore != null && trustScore > 0
          ? trustScore >= 80
            ? "Excellent"
            : trustScore >= 60
              ? "Good"
              : "Average"
          : "Not scored",
      color: "text-brand",
    },
    {
      icon: TrendingUp,
      value: responseRate != null ? `${responseRate}%` : "\u2014",
      label: "Response Rate",
      sub:
        responseRate != null
          ? responseRate >= 80
            ? "Very Responsive"
            : "Responsive"
          : "Not shared",
      color: "text-success",
    },
    {
      icon: Star,
      value: average > 0 ? average.toFixed(1) : "\u2014",
      label: "Rating",
      sub: count > 0 ? `${count} Review${count === 1 ? "" : "s"}` : "No reviews",
      color: "text-warning",
    },
    {
      icon: Briefcase,
      value: projects > 0 ? String(projects) : "\u2014",
      label: "Projects",
      sub: projects > 0 ? "Completed" : "None yet",
      color: "text-pink",
    },
  ];

  return (
    <section className="grid grid-cols-4 rounded-2xl bg-card py-4 shadow-[var(--shadow-card)]">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex flex-col items-center px-1 text-center ${
            i > 0 ? "border-l border-border/60" : ""
          }`}
        >
          <s.icon className={`size-4 ${s.color}`} />
          <p className="mt-1.5 text-lg font-extrabold leading-none text-foreground">
            {s.value}
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
            {s.label}
          </p>
          <p className="mt-0.5 text-[9.5px] font-semibold leading-tight text-brand">
            {s.sub}
          </p>
        </div>
      ))}
    </section>
  );
}
