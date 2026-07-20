"use client";

import { MapPin, Briefcase, Globe, Languages, Check } from "lucide-react";
import type { EnrichedApplication } from "../campaign-application-card";

interface TalentOverviewTabProps {
  application: EnrichedApplication;
}

export function TalentOverviewTab({ application }: TalentOverviewTabProps) {
  const talent =
    typeof application.talent_id === "object" && application.talent_id !== null
      ? application.talent_id
      : null;
  const profile = application.talent_profile;
  const displayName = talent?.full_legal_name || talent?.email || "Unknown";
  const professions = profile?.professions || [];
  const location = profile?.location;
  const loc = [location?.city, location?.state, location?.country]
    .filter(Boolean)
    .join(", ");
  const languages = profile?.languages || [];
  const specialties = profile?.specialties || [];
  const isVerified = profile?.is_verified ?? false;

  return (
    <div className="space-y-5 py-1">
      {/* Match score breakdown */}
      <div className="rounded-xl border border-border/60 bg-cream-pale/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
            Match Score
          </span>
          <span className="text-2xl font-bold text-brand">
            {application.match_score}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted-bg overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-gold transition-all duration-500"
            style={{ width: `${application.match_score}%` }}
          />
        </div>
      </div>

      {/* Location */}
      {loc && (
        <div className="flex items-center gap-2.5 text-sm">
          <MapPin className="w-4 h-4 text-ink-muted shrink-0" strokeWidth={1.5} />
          <span className="text-ink-soft">{loc}</span>
        </div>
      )}

      {/* Availability */}
      {profile?.availability && (
        <div className="flex items-center gap-2.5 text-sm">
          <span className="w-4 h-4 rounded-full border-2 shrink-0" />
          <span className="text-ink-soft capitalize">{profile.availability.replace(/_/g, " ")}</span>
        </div>
      )}

      {/* Verification */}
      <div className="flex items-center gap-2.5 text-sm">
        <Check className="w-4 h-4 text-ink-muted shrink-0" strokeWidth={1.5} />
        <span className={isVerified ? "text-emerald-600 font-medium" : "text-ink-muted"}>
          {isVerified ? "Verified Profile" : "Not verified"}
        </span>
      </div>

      {/* Professions */}
      {professions.length > 0 && (
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted flex items-center gap-1.5">
            <Briefcase className="w-3 h-3" strokeWidth={1.5} />
            Professions
          </label>
          <div className="flex flex-wrap gap-1.5">
            {professions.map((p) => (
              <span
                key={p}
                className="px-2.5 py-1 rounded-lg bg-muted-bg text-text-secondary text-xs font-medium border border-border/60"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted flex items-center gap-1.5">
            <Globe className="w-3 h-3" strokeWidth={1.5} />
            Specialties
          </label>
          <div className="flex flex-wrap gap-1.5">
            {specialties.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 rounded-lg bg-gold-soft text-gold-ink text-xs font-medium border border-gold/20"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted flex items-center gap-1.5">
            <Languages className="w-3 h-3" strokeWidth={1.5} />
            Languages
          </label>
          <div className="flex flex-wrap gap-1.5">
            {languages.map((l) => (
              <span
                key={l.name}
                className="px-2.5 py-1 rounded-lg bg-muted-bg text-text-secondary text-xs font-medium border border-border/60"
              >
                {l.name}
                {l.fluency && (
                  <span className="text-text-muted ml-1">· {l.fluency}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loc && !professions.length && !specialties.length && !languages.length && (
        <div className="text-center py-8">
          <p className="text-sm text-ink-muted">No additional profile details available.</p>
          <p className="text-xs text-ink-muted/60 mt-1">
            Visit the full profile for more information.
          </p>
        </div>
      )}
    </div>
  );
}
