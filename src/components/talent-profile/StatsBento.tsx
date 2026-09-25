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
      color: "text-[#2563EB]",
      surface: "bg-blue-50/60",
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
      color: "text-[#0F9F92]",
      surface: "bg-teal-50/60",
    },
    {
      icon: Star,
      value: average > 0 ? average.toFixed(1) : "—",
      label: "Rating",
      note: count > 0 ? `${count} Review${count === 1 ? "" : "s"}` : "No reviews",
      color: "text-[#D97706]",
      surface: "bg-amber-50/65",
    },
    {
      icon: Bookmark,
      value: shortlistCount > 0 ? String(shortlistCount) : "—",
      label: "Shortlists",
      note: shortlistCount > 0 ? "Saved by recruiters" : "None yet",
      color: "text-[#C026D3]",
      surface: "bg-fuchsia-50/65",
    },
  ];

  return (
    <section className="rounded-[20px] bg-card/95 p-3 shadow-[0_6px_24px_rgba(15,23,42,0.05)]">
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl px-1 py-2 text-center ${s.surface}`}>
            <span className={`mx-auto grid size-7 place-items-center rounded-lg bg-white/70 ${s.color}`}>
              <s.icon className="size-4" />
            </span>
            <p className="mt-2 text-[19px] font-extrabold leading-none text-foreground">
              {s.value}
            </p>
            <p className="mt-1 text-[10px] font-semibold leading-tight text-muted-foreground">
              {s.label}
            </p>
            <p className={`mt-1 text-[9px] font-semibold leading-tight ${s.color}`}>
              {s.note}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
