"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Zap,
  Languages,
  Mic,
  ScanLine,
  FileText,
  Share2,
  Shield,
  Check,
  Download,
  Globe,
  Link,
  Calendar,
  Ruler,
  Weight,
  Eye,
  Palette,
  Scissors,
  Sparkles,
} from "lucide-react";
import {
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaTiktok,
  FaGithub,
  FaBehance,
  FaDribbble,
  FaVimeoV,
  FaSpotify,
  FaSnapchat,
  FaThreads,
} from "react-icons/fa6";
import type { ComponentType } from "react";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PLATFORM_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  instagram: FaInstagram,
  youtube: FaYoutube,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  facebook: FaFacebook,
  tiktok: FaTiktok,
  github: FaGithub,
  behance: FaBehance,
  dribbble: FaDribbble,
  vimeo: FaVimeoV,
  spotify: FaSpotify,
  snapchat: FaSnapchat,
  threads: FaThreads,
  website: Globe,
};

function platformLabel(platform: string): string {
  const map: Record<string, string> = {
    twitter: "Twitter / X",
    website: "Website",
  };
  return map[platform] ?? platform.charAt(0).toUpperCase() + platform.slice(1);
}

const gold = {
  primary: "var(--color-gold)",
  primaryHover: "var(--color-gold-hover)",
  accent: "var(--color-gold-soft)",
  accentBorder: "var(--color-gold)",
  border: "var(--color-border)",
  muted: "var(--color-cream)",
  mutedFg: "var(--color-ink-muted)",
  textSecondary: "var(--color-ink-soft)",
  foreground: "var(--color-ink)",
  background: "var(--color-cream-pale)",
  card: "var(--color-card)",
};

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  children: React.ReactNode;
}) {
  return (
    <Card
      className="rounded-[14px] p-4 gap-3"
      style={{ background: gold.card, borderColor: gold.border }}
    >
      <CardHeader className="p-0 flex flex-row items-center gap-2">
        {Icon && <Icon className="w-4 h-4" style={{ color: gold.primary }} strokeWidth={2} />}
        <CardTitle className="text-[13px] font-semibold" style={{ color: gold.foreground }}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border"
      style={{ background: gold.accent, color: "var(--color-campaign-dark)", borderColor: gold.accentBorder }}
    >
      {children}
    </span>
  );
}

function InfoRow({ label, value, icon: Icon }: {
  label: string;
  value?: string | number | null;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: gold.mutedFg }} strokeWidth={2} />}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: gold.mutedFg }}>{label}</p>
        <p className="text-[13px]" style={{ color: gold.foreground }}>{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePreviewPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    talentApi
      .getMyProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load profile"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: gold.background }}>
        <div className="h-14 border-b" style={{ borderColor: gold.border }} />
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-32 rounded-[14px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-[14px]" />
            <Skeleton className="h-40 rounded-[14px]" />
            <Skeleton className="h-40 rounded-[14px]" />
            <Skeleton className="h-40 rounded-[14px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-6" style={{ background: gold.background }}>
        <button
          onClick={() => router.push("/talent/profile")}
          className="flex items-center gap-2 text-sm mb-4"
          style={{ color: gold.mutedFg }}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayName = profile?.full_legal_name || profile?.username || "Talent";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const loc = [profile?.location?.city, profile?.location?.state, profile?.location?.country]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  return (
    <div className="min-h-screen" style={{ background: gold.background }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: gold.background, borderColor: gold.border }}
      >
        <button
          onClick={() => router.push("/talent/profile")}
          className="flex items-center gap-1.5 text-[13px] font-medium transition-colors"
          style={{ color: gold.mutedFg }}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back to edit
        </button>
        <span className="text-[17px] font-semibold" style={{ color: gold.foreground }}>Preview</span>
        <div className="w-20" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Hero */}
        <Card
          className="rounded-[14px] p-5 flex flex-col sm:flex-row items-start gap-5"
          style={{ background: gold.card, borderColor: gold.border }}
        >
          <div
            className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-[28px] font-bold text-white shrink-0 border-[3px]"
            style={{
              background: profile?.profile_photo ? undefined : "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
              borderColor: gold.accentBorder,
            }}
          >
            {profile?.profile_photo ? (
              <img src={profile.profile_photo} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="font-serif">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold" style={{ color: gold.foreground }}>
                {displayName}
              </h1>
              {profile?.is_verified && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </span>
              )}
            </div>
            {profile?.username && (
              <p className="text-sm" style={{ color: gold.mutedFg }}>@{profile.username}</p>
            )}
            {profile?.headline && (
              <p className="text-[15px] mt-1" style={{ color: gold.textSecondary }}>{profile.headline}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {profile?.availability && (
                <span
                  className="px-2.5 py-0.5 text-xs font-medium rounded-full border"
                  style={{
                    background: profile.availability === "available" ? "var(--color-success-light)" : profile.availability === "busy" ? gold.accent : "var(--color-error-light)",
                    color: profile.availability === "available" ? "var(--color-success-text)" : profile.availability === "busy" ? "var(--color-campaign-dark)" : "var(--color-error)",
                    borderColor: profile.availability === "available" ? "var(--color-success-muted)" : profile.availability === "busy" ? gold.accentBorder : "var(--color-error-muted)",
                  }}
                >
                  {profile.availability === "available" ? "Available" : profile.availability === "busy" ? "Busy" : "Not available"}
                </span>
              )}
              {profile?.professions?.map((p) => (
                <Tag key={p}>{p}</Tag>
              ))}
            </div>
            {loc && (
              <div className="flex items-center gap-1.5 mt-2">
                <span style={{ color: gold.mutedFg }}><MapPin className="w-3.5 h-3.5" strokeWidth={2} /></span>
                <span className="text-xs" style={{ color: gold.mutedFg }}>{loc}</span>
              </div>
            )}
          </div>
        </Card>

        {/* About */}
        {profile?.about && (
          <SectionCard title="About" icon={Sparkles}>
            <p className="text-[13px] leading-relaxed" style={{ color: gold.textSecondary }}>
              {profile.about}
            </p>
          </SectionCard>
        )}

        {/* Grid of info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          {loc && (
            <SectionCard title="Location" icon={MapPin}>
              <div className="space-y-2">
                {profile?.location?.country && <InfoRow label="Country" value={profile.location.country} icon={Globe} />}
                {profile?.location?.state && <InfoRow label="State" value={profile.location.state} />}
                {profile?.location?.city && <InfoRow label="City" value={profile.location.city} />}
              </div>
            </SectionCard>
          )}

          {/* Career */}
          <SectionCard title="Career" icon={Briefcase}>
            <div className="space-y-2">
              {profile?.specialties && profile.specialties.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide mb-1.5" style={{ color: gold.mutedFg }}>Specialties</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.specialties.map((i) => <Tag key={i}>{i}</Tag>)}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <SectionCard title="Skills" icon={Zap}>
              <div className="flex flex-col gap-2">
                {profile.skills.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                    style={{ borderColor: gold.border }}
                  >
                    <span className="text-[13px] font-medium" style={{ color: gold.foreground }}>{s.name}</span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-md border"
                      style={{ background: gold.accent, borderColor: gold.accentBorder, color: "var(--color-campaign-dark)" }}
                    >
                      {s.proficiency ? s.proficiency.charAt(0).toUpperCase() + s.proficiency.slice(1) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Languages */}
          {profile?.languages && profile.languages.length > 0 && (
            <SectionCard title="Languages" icon={Languages}>
              <div className="flex flex-col gap-2">
                {profile.languages.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                    style={{ borderColor: gold.border }}
                  >
                    <span className="text-[13px] font-medium" style={{ color: gold.foreground }}>{l.name}</span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-md border"
                      style={{ background: gold.accent, borderColor: gold.accentBorder, color: "var(--color-campaign-dark)" }}
                    >
                      {l.fluency ? l.fluency.charAt(0).toUpperCase() + l.fluency.slice(1) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Accents */}
          {profile?.accents && profile.accents.length > 0 && (
            <SectionCard title="Accents" icon={Mic}>
              <div className="flex flex-wrap gap-1.5">
                {profile.accents.map((a) => <Tag key={a}>{a}</Tag>)}
              </div>
            </SectionCard>
          )}

          {/* Physical Attributes */}
          {profile?.physical_attributes && (
            <SectionCard title="Physical Attributes" icon={ScanLine}>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Height" value={profile.physical_attributes.height_cm ? `${profile.physical_attributes.height_cm} cm` : null} icon={Ruler} />
                <InfoRow label="Weight" value={profile.physical_attributes.weight_kg ? `${profile.physical_attributes.weight_kg} kg` : null} icon={Weight} />
                <InfoRow label="Body type" value={profile.physical_attributes.body_type} icon={Shield} />
                <InfoRow label="Complexion" value={profile.physical_attributes.complexion} icon={Palette} />
                <InfoRow label="Hair color" value={profile.physical_attributes.hair_color} icon={Sparkles} />
                <InfoRow label="Hair length" value={profile.physical_attributes.hair_length} icon={Scissors} />
                <InfoRow label="Eye color" value={profile.physical_attributes.eye_color} icon={Eye} />
                {profile.physical_attributes.distinctive_features && (
                  <div className="col-span-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: gold.mutedFg }}>Distinctive features</p>
                    <p className="text-[13px]" style={{ color: gold.foreground }}>{profile.physical_attributes.distinctive_features}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Documents */}
          {profile?.documents?.resume_url && (
            <SectionCard title="Documents" icon={FileText}>
              <a
                href={profile.documents.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] font-medium px-3 py-2 rounded-lg border transition-colors"
                style={{ background: gold.background, borderColor: gold.border, color: gold.foreground }}
              >
                <span style={{ color: gold.primary }}><Download className="w-4 h-4" strokeWidth={2} /></span>
                Download resume
              </a>
            </SectionCard>
          )}

          {/* Social Links */}
          {(() => {
            const entries = Object.entries(profile?.social_links ?? {}).filter(
              ([, link]) => link?.url,
            );
            if (entries.length === 0) return null;
            return (
              <SectionCard title="Social Links" icon={Share2}>
                <div className="flex flex-col gap-2">
                  {entries.map(([platform, link]) => {
                    const Icon = PLATFORM_ICON_MAP[platform] ?? Link;
                    const label = platformLabel(platform);
                    return (
                      <a
                        key={platform}
                        href={link!.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[13px]"
                        style={{ color: gold.foreground }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-cream/70">
                          <Icon className="w-4 h-4" />
                        </div>
                        {label}
                      </a>
                    );
                  })}
                </div>
              </SectionCard>
            );
          })()}

          {/* Privacy */}
          {profile?.privacy_mode && (
            <SectionCard title="Privacy" icon={Shield}>
              <p className="text-[13px]" style={{ color: gold.textSecondary }}>
                Profile visibility: <span className="font-medium" style={{ color: gold.foreground }}>
                  {profile.privacy_mode.charAt(0).toUpperCase() + profile.privacy_mode.slice(1)}
                </span>
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
