"use client";

import { Card } from "@/components/ui/card";
import { Building2, Briefcase, MapPinned, CalendarDays } from "lucide-react";
import type { RecruiterPublicProfile } from "@/lib/validations/recruiter-profile.schema";

interface RecruiterAboutCardProps {
  profile: RecruiterPublicProfile;
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{value || "—"}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function RecruiterAboutCard({ profile }: RecruiterAboutCardProps) {
  const locationStr =
    profile.location
      ? [profile.location.city, profile.location.state, profile.location.country]
          .filter(Boolean)
          .join(", ")
      : null;

  return (
    <Card className="border-border p-5 shadow-card">
      <h2 className="mb-4 text-base font-bold">About {profile.company_name}</h2>
      {profile.about && (
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          {profile.about}
        </p>
      )}
      <div className="space-y-3">
        {profile.industry && (
          <MetaRow
            icon={<Building2 className="h-4 w-4" />}
            label="Industry"
            value={profile.industry}
          />
        )}
        {profile.company_size && (
          <MetaRow
            icon={<Briefcase className="h-4 w-4" />}
            label="Company Size"
            value={profile.company_size}
          />
        )}
        {locationStr && (
          <MetaRow
            icon={<MapPinned className="h-4 w-4" />}
            label="Headquarters"
            value={locationStr}
          />
        )}
        {profile.founded_year && (
          <MetaRow
            icon={<CalendarDays className="h-4 w-4" />}
            label="Founded"
            value={String(profile.founded_year)}
          />
        )}
      </div>
    </Card>
  );
}
