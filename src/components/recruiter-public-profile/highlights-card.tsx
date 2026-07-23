"use client";

import { Card } from "@/components/ui/card";
import { BadgeCheck, Zap, Trophy, UserPlus } from "lucide-react";
import type { RecruiterPublicProfile } from "@/lib/validations/recruiter-profile.schema";

interface RecruiterHighlightsCardProps {
  profile: RecruiterPublicProfile;
}

export function RecruiterHighlightsCard({ profile }: RecruiterHighlightsCardProps) {
  const isVerified = profile.verification_status === "approved";
  const isEnterprise = profile.active_plan === "enterprise";

  const highlights = [
    {
      icon: BadgeCheck,
      title: isVerified ? "Verified Company" : "Identity Verified",
      sub: isVerified ? "Fully verified" : `Tier ${profile.verification_tier}`,
      color: isVerified ? "text-success" : "text-amber",
    },
    {
      icon: Zap,
      title: "Trust Score",
      sub: `${profile.trust_score}%`,
      color: "text-amber",
    },
    {
      icon: Trophy,
      title: isEnterprise ? "Enterprise Partner" : profile.active_plan || "Free Plan",
      sub: isEnterprise ? "Top tier" : `${profile.active_campaigns_count} active jobs`,
      color: "text-amber",
    },
    {
      icon: UserPlus,
      title: profile.specialties?.[0] || "Hiring",
      sub: `${(profile.specialties?.length ?? 0) + 1} specialties`,
      color: "text-primary",
    },
  ];

  return (
    <Card className="border-border p-5 shadow-card">
      <h2 className="mb-4 text-base font-bold">Company Highlights</h2>
      <ul className="space-y-4">
        {highlights.map((h) => (
          <li key={h.title} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <h.icon className={`h-5 w-5 ${h.color}`} />
            </div>
            <div>
              <div className="text-sm font-semibold">{h.title}</div>
              <div className="text-xs text-muted-foreground">{h.sub}</div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
