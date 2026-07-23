"use client";

import { Heart, MessageSquare, Share2, MapPin, Globe, Building2, BadgeCheck } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecruiterPublicProfile } from "@/lib/validations/recruiter-profile.schema";
import { ShareProfileDialog } from "@/components/share-profile-dialog";

interface RecruiterHeroCardProps {
  profile: RecruiterPublicProfile;
  trustScore: number;
  onMessage?: () => void;
  onFollow?: () => void;
}

function StatBlock({
  label,
  value,
  sub,
  subClass,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  subClass?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold leading-tight">
        {value}
      </div>
      {sub && (
        <div className={`text-xs font-medium ${subClass ?? ""}`}>{sub}</div>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatMemberSince(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

function getLocationString(location?: RecruiterPublicProfile["location"]): string | null {
  if (!location) return null;
  const parts = [location.city, location.state, location.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

export function RecruiterHeroCard({ profile, onMessage, onFollow }: RecruiterHeroCardProps) {
  const initials = getInitials(profile.company_name);
  const locationStr = getLocationString(profile.location);
  const memberSince = formatMemberSince(profile.member_since);
  const isVerified = profile.verification_status === "approved";

  const companyInitial = profile.company_name[0]?.toUpperCase() || "C";

  return (
    <Card className="overflow-hidden border-border p-0 shadow-card">
      <div className="relative h-40 bg-gradient-to-br from-primary via-primary to-primary/80 md:h-52">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,oklch(0.769_0.169_70.5/0.25),transparent_50%),radial-gradient(circle_at_80%_60%,oklch(0.696_0.17_162.48/0.2),transparent_50%)]" />
        {profile.linkedin_company_url && (
          <a
            href={profile.linkedin_company_url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-background/90 text-primary"
          >
            <FaLinkedin className="h-5 w-5" />
          </a>
        )}
      </div>

      <div className="relative p-5 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-6">
          {/* Logo */}
          <div className="relative -mt-20 md:-mt-28">
            {profile.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt={profile.company_name}
                className="h-32 w-32 rounded-2xl border-4 border-background bg-card object-cover shadow-elevated md:h-40 md:w-40"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-background bg-primary text-primary-foreground shadow-elevated md:h-40 md:w-40">
                <div className="text-center">
                  <div className="text-4xl font-black tracking-tight md:text-5xl">
                    {companyInitial}
                  </div>
                  {profile.company_name.length > 10 && (
                    <div className="mt-1 text-[8px] font-bold tracking-[0.15em] text-amber md:text-[9px]">
                      {profile.company_name.substring(0, 10).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            )}
            {isVerified && (
              <div className="absolute -right-1 bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-success text-success-foreground">
                <BadgeCheck className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {profile.company_name}
              </h1>
              {isVerified && (
                <Badge className="rounded-full bg-amber-soft text-amber-foreground hover:bg-amber-soft">
                  <BadgeCheck className="mr-1 h-3.5 w-3.5 text-amber" />
                  Verified Company
                </Badge>
              )}
            </div>
            {profile.headline && (
              <p className="mt-1 text-sm text-muted-foreground">{profile.headline}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {locationStr && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber" />
                  {locationStr}
                </span>
              )}
              {profile.company_website && (
                <a
                  href={
                    profile.company_website.startsWith("http")
                      ? profile.company_website
                      : `https://${profile.company_website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  {profile.company_website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:self-end">
            <button
              onClick={onFollow}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground md:flex-none md:px-6"
            >
              <Heart className="h-4 w-4" />
              Follow
            </button>
            <button
              onClick={onMessage}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground md:flex-none md:px-6"
            >
              <MessageSquare className="h-4 w-4" />
              Message
            </button>
            <ShareProfileDialog
              url={`${typeof window !== "undefined" ? window.location.origin : ""}/recruiter/${profile.slug}`}
              name={profile.company_name}
              profilePhoto={profile.profile_photo ?? null}
            >
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
                <Share2 className="h-4 w-4" />
              </button>
            </ShareProfileDialog>
          </div>
        </div>

        {/* Stat strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-border bg-background/60 p-4 md:grid-cols-6">
          <StatBlock label="Active Jobs" value={profile.active_campaigns_count} />
          <StatBlock label="Trust Score" value={`${profile.trust_score}%`} />
          <StatBlock label="Verification Tier" value={`Tier ${profile.verification_tier}`} />
          <StatBlock
            label="Company Size"
            value={
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {profile.company_size || "—"}
              </span>
            }
          />
          <StatBlock label="Industry" value={profile.industry || "—"} />
          <StatBlock label="Member Since" value={memberSince} />
        </div>
      </div>
    </Card>
  );
}
