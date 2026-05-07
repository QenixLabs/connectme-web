"use client";

import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

interface ProfileViewProps {
  profile: TalentProfile;
  onEdit: () => void;
}

const DASH = "—";

function showStr(v?: string | null): string {
  return v && v.trim() !== "" ? v : DASH;
}

function showNum(v?: number | null, suffix = ""): string {
  return typeof v === "number" && Number.isFinite(v) ? `${v}${suffix}` : DASH;
}

function formatDob(v?: string | null): string {
  if (!v) return DASH;
  const s = typeof v === "string" ? v.slice(0, 10) : DASH;
  return s || DASH;
}

function titleCase(v?: string | null): string {
  if (!v) return DASH;
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-sm text-text-primary mt-0.5 break-words">{value}</p>
    </div>
  );
}

function Pills({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <span className="text-sm text-text-muted">{DASH}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <span
          key={it}
          className="px-2 py-0.5 text-xs rounded-full bg-muted-bg text-text-secondary border border-border"
        >
          {it}
        </span>
      ))}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-base font-semibold text-text-primary mb-4">{title}</h2>;
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  const loc = [profile.location?.city, profile.location?.state, profile.location?.country]
    .filter((s) => s && s.trim() !== "")
    .join(", ");

  const phys = profile.physical_attributes;
  const docs = profile.documents;
  const socials = profile.social_links;

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          {profile.profile_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profile_photo}
              alt={profile.full_legal_name ?? profile.username ?? "Profile"}
              className="w-20 h-20 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted-bg border border-border flex items-center justify-center text-text-muted text-xl font-semibold">
              {(profile.full_legal_name ?? profile.username ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text-primary truncate">
              {showStr(profile.full_legal_name)}
            </h1>
            {profile.username && (
              <p className="text-sm text-text-tertiary">@{profile.username}</p>
            )}
            {profile.headline && (
              <p className="text-sm text-text-secondary mt-2">{profile.headline}</p>
            )}
            {loc && <p className="text-xs text-text-muted mt-1">{loc}</p>}
          </div>
          <Button variant="outline" onClick={onEdit} className="px-4">
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
            Edit
          </Button>
        </div>
        {profile.about && (
          <p className="text-sm text-text-secondary mt-5 whitespace-pre-wrap">{profile.about}</p>
        )}
      </Card>

      {/* IDENTITY */}
      <Card className="p-6">
        <SectionHeader title="Identity" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full legal name" value={showStr(profile.full_legal_name)} />
          <Field label="Date of birth" value={formatDob(profile.date_of_birth)} />
          <Field label="Gender" value={titleCase(profile.gender)} />
          <Field label="Username" value={profile.username ? `@${profile.username}` : DASH} />
        </div>
      </Card>

      {/* LOCATION */}
      <Card className="p-6">
        <SectionHeader title="Location" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Country" value={showStr(profile.location?.country)} />
          <Field label="State" value={showStr(profile.location?.state)} />
          <Field label="City" value={showStr(profile.location?.city)} />
        </div>
      </Card>

      {/* CAREER */}
      <Card className="p-6">
        <SectionHeader title="Career" />
        <div className="space-y-4">
          <Field label="Professions" value={<Pills items={profile.professions} />} />
          <Field label="Industries" value={<Pills items={profile.industries} />} />
          <Field label="Availability" value={titleCase(profile.availability)} />
        </div>
      </Card>

      {/* SKILLS */}
      <Card className="p-6">
        <SectionHeader title="Skills" />
        {profile.skills && profile.skills.length > 0 ? (
          <ul className="space-y-2">
            {profile.skills.map((s, i) => (
              <li
                key={`${s.name}-${i}`}
                className="flex items-center justify-between text-sm border-b border-border last:border-b-0 pb-2 last:pb-0"
              >
                <span className="text-text-primary">{s.name}</span>
                <span className="text-xs text-text-tertiary">{titleCase(s.proficiency)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">No skills added.</p>
        )}
      </Card>

      {/* LANGUAGES */}
      <Card className="p-6">
        <SectionHeader title="Languages" />
        {profile.languages && profile.languages.length > 0 ? (
          <ul className="space-y-2">
            {profile.languages.map((l, i) => (
              <li
                key={`${l.name ?? "lang"}-${i}`}
                className="flex items-center justify-between text-sm border-b border-border last:border-b-0 pb-2 last:pb-0"
              >
                <span className="text-text-primary">{showStr(l.name)}</span>
                <span className="text-xs text-text-tertiary">{titleCase(l.fluency)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">No languages added.</p>
        )}
      </Card>

      {/* ACCENTS */}
      <Card className="p-6">
        <SectionHeader title="Accents" />
        <Pills items={profile.accents} />
      </Card>

      {/* PHYSICAL */}
      <Card className="p-6">
        <SectionHeader title="Physical attributes" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Height" value={showNum(phys?.height_cm, " cm")} />
          <Field label="Weight" value={showNum(phys?.weight_kg, " kg")} />
          <Field label="Body type" value={titleCase(phys?.body_type)} />
          <Field label="Complexion" value={titleCase(phys?.complexion)} />
          <Field label="Hair color" value={titleCase(phys?.hair_color)} />
          <Field label="Hair length" value={titleCase(phys?.hair_length)} />
          <Field label="Eye color" value={titleCase(phys?.eye_color)} />
          <Field
            label="Distinctive features"
            value={showStr(phys?.distinctive_features)}
          />
        </div>
      </Card>

      {/* DOCUMENTS */}
      <Card className="p-6">
        <SectionHeader title="Documents" />
        <div className="space-y-3 text-sm">
          <DocLink label="Resume" url={docs?.resume_url} />
          <DocLink label="Portfolio PDF" url={docs?.portfolio_pdf_url} />
          <DocLink label="Measurements sheet" url={docs?.measurements_sheet_url} />
        </div>
      </Card>

      {/* SOCIAL */}
      <Card className="p-6">
        <SectionHeader title="Social links" />
        <div className="space-y-3 text-sm">
          {(["instagram", "youtube", "linkedin"] as const).map((platform) => {
            const link = socials?.[platform];
            return (
              <div key={platform} className="flex items-center justify-between gap-3">
                <span className="text-text-tertiary capitalize">{platform}</span>
                <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                  {link?.url ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-hover hover:underline truncate"
                    >
                      {link.url}
                    </a>
                  ) : (
                    <span className="text-text-muted">{DASH}</span>
                  )}
                  {link?.url && link?.visibility && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-muted-bg text-text-secondary border border-border whitespace-nowrap">
                      {titleCase(link.visibility)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* PRIVACY */}
      <Card className="p-6">
        <SectionHeader title="Privacy" />
        <Field label="Profile visibility" value={titleCase(profile.privacy_mode)} />
      </Card>

      {/* FLOATING EDIT (mobile) */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border px-4 py-3 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <p className="text-xs text-text-muted truncate">
            {profile.username ? `@${profile.username}` : ""}
          </p>
          <Button onClick={onEdit} className="px-6">
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
            Edit profile
          </Button>
        </div>
      </div>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-tertiary">{label}</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-hover hover:underline truncate"
        >
          {url}
        </a>
      ) : (
        <span className="text-text-muted">{DASH}</span>
      )}
    </div>
  );
}
