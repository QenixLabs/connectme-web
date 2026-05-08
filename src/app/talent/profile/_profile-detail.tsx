"use client";

import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DASH, showStr, showNum, formatDob, titleCase, formatLocation } from "@/lib/talent-profile/display-helpers";

interface ProfileDetailProps {
  profile: TalentProfile;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      <div className="text-sm text-text-primary mt-0.5 break-words">{value}</div>
    </div>
  );
}

function Pills({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <span className="text-sm text-text-muted">{DASH}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <Badge key={it} variant="secondary">
          {it}
        </Badge>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function DocLink({ label, url }: { label: string; url?: string }) {
  if (!url) return <Field label={label} value={DASH} />;
  return (
    <Field
      label={label}
      value={
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-hover hover:underline truncate block"
        >
          {url}
        </a>
      }
    />
  );
}

export function ProfileDetail({ profile }: ProfileDetailProps) {
  const loc = formatLocation([
    profile.location?.city,
    profile.location?.state,
    profile.location?.country,
  ]);

  const phys = profile.physical_attributes;
  const docs = profile.documents;
  const socials = profile.social_links;

  return (
    <div className="space-y-4">
      <Section title="Identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full legal name" value={showStr(profile.full_legal_name)} />
          <Field label="Date of birth" value={formatDob(profile.date_of_birth)} />
          <Field label="Gender" value={titleCase(profile.gender)} />
          <Field
            label="Username"
            value={profile.username ? `@${profile.username}` : DASH}
          />
        </div>
        {profile.headline && (
          <p className="text-sm text-text-secondary mt-4">{profile.headline}</p>
        )}
        {profile.about && (
          <p className="text-sm text-text-secondary mt-2 whitespace-pre-wrap">{profile.about}</p>
        )}
      </Section>

      <Section title="Location">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Country" value={showStr(profile.location?.country)} />
          <Field label="State" value={showStr(profile.location?.state)} />
          <Field label="City" value={showStr(profile.location?.city)} />
        </div>
        {loc && <p className="text-sm text-text-muted mt-3">{loc}</p>}
      </Section>

      <Section title="Career">
        <div className="space-y-4">
          <Field label="Professions" value={<Pills items={profile.professions} />} />
          <Field label="Industries" value={<Pills items={profile.industries} />} />
          <Field label="Availability" value={titleCase(profile.availability)} />
        </div>
      </Section>

      <Section title="Skills">
        {profile.skills && profile.skills.length > 0 ? (
          <ul className="space-y-2">
            {profile.skills.map((s, i, arr) => (
              <li key={`${s.name}-${i}`}>
                <div className="flex items-center justify-between text-sm pb-2">
                  <span className="text-text-primary">{s.name}</span>
                  <span className="text-xs text-text-tertiary">{titleCase(s.proficiency)}</span>
                </div>
                {i < arr.length - 1 && <Separator />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">No skills added.</p>
        )}
      </Section>

      <Section title="Languages">
        {profile.languages && profile.languages.length > 0 ? (
          <ul className="space-y-2">
            {profile.languages.map((l, i, arr) => (
              <li key={`${l.name ?? "lang"}-${i}`}>
                <div className="flex items-center justify-between text-sm pb-2">
                  <span className="text-text-primary">{showStr(l.name)}</span>
                  <span className="text-xs text-text-tertiary">{titleCase(l.fluency)}</span>
                </div>
                {i < arr.length - 1 && <Separator />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">No languages added.</p>
        )}
      </Section>

      <Section title="Accents">
        <Pills items={profile.accents} />
      </Section>

      <Section title="Physical attributes">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Height" value={showNum(phys?.height_cm, " cm")} />
          <Field label="Weight" value={showNum(phys?.weight_kg, " kg")} />
          <Field label="Body type" value={titleCase(phys?.body_type)} />
          <Field label="Complexion" value={titleCase(phys?.complexion)} />
          <Field label="Hair color" value={titleCase(phys?.hair_color)} />
          <Field label="Hair length" value={titleCase(phys?.hair_length)} />
          <Field label="Eye color" value={titleCase(phys?.eye_color)} />
          <Field label="Distinctive features" value={showStr(phys?.distinctive_features)} />
        </div>
      </Section>

      <Section title="Documents">
        <div className="space-y-3">
          <DocLink label="Resume" url={docs?.resume_url} />
          <DocLink label="Portfolio PDF" url={docs?.portfolio_pdf_url} />
          <DocLink label="Measurements sheet" url={docs?.measurements_sheet_url} />
        </div>
      </Section>

      <Section title="Social links">
        <div className="space-y-3">
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
                      className="text-brand-hover hover:underline truncate text-sm"
                    >
                      {link.url}
                    </a>
                  ) : (
                    <span className="text-text-muted text-sm">{DASH}</span>
                  )}
                  {link?.url && link?.visibility && (
                    <Badge variant="secondary">
                      {titleCase(link.visibility)}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Privacy">
        <Field label="Profile visibility" value={titleCase(profile.privacy_mode)} />
      </Section>
    </div>
  );
}
