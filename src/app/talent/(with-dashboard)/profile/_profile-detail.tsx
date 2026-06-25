"use client";

import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { Card } from "@/components/ui/card";

interface ProfileDetailProps {
  profile: TalentProfile;
}

export function ProfileDetail({ profile }: ProfileDetailProps) {
  const analytics = profile.analytics as
    | { profile_views_30d?: number; shortlist_count?: number }
    | undefined;
  const socialCount = [
    profile.social_links?.instagram?.url,
    profile.social_links?.youtube?.url,
    profile.social_links?.linkedin?.url,
  ].filter(Boolean).length;
  const stats = [
    { value: String(analytics?.profile_views_30d ?? 0), label: "Monthly Views" },
    { value: String(analytics?.shortlist_count ?? 0), label: "Shortlists" },
    { value: String(socialCount), label: "Social Links" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((s) => (
        <Card key={s.label} className="text-center py-3 px-2">
          <p className="text-[20px] font-bold text-ink leading-none font-serif">{s.value}</p>
          <p className="text-[11px] text-ink-muted mt-1">{s.label}</p>
        </Card>
      ))}
    </div>
  );
}
