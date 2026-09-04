"use client";

import { ShieldCheck, TrendingUp, Star, Bookmark } from "lucide-react";
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
  const shortlistCount = profile.analytics?.shortlist_count ?? 0;

  const stats = [
    {
      icon: ShieldCheck,
      value: trustScore != null && trustScore > 0 ? String(trustScore) : "—",
      label: "RootScore",
      note:
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
      value: responseRate != null ? `${responseRate}%` : "—",
      label: "Response Rate",
      note:
        responseRate != null
          ? responseRate >= 80
            ? "Very Responsive"
            : "Responsive"
          : "Not shared",
      color: "text-success",
    },
    {
      icon: Star,
      value: average > 0 ? average.toFixed(1) : "—",
      label: "Rating",
      note: count > 0 ? `${count} Review${count === 1 ? "" : "s"}` : "No reviews",
      color: "text-gold",
    },
    {
      icon: Bookmark,
      value: shortlistCount > 0 ? String(shortlistCount) : "—",
      label: "Shortlists",
      note: shortlistCount > 0 ? "Saved by recruiters" : "None yet",
      color: "text-pink",
    },
  ];

  return (
    <section className="rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-4 divide-x divide-border">
        {stats.map((s) => (
          <div key={s.label} className="px-1 text-center">
            <s.icon className={`mx-auto size-5 ${s.color}`} />
            <p className="mt-1.5 text-[20px] font-extrabold leading-none text-foreground">
              {s.value}
            </p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-brand">
              {s.note}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
