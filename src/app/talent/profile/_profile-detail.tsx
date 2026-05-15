"use client";

import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DASH, showStr, showNum, formatDob, titleCase, formatLocation } from "@/lib/talent-profile/display-helpers";
import { Pencil } from "lucide-react";

interface ProfileDetailProps {
  profile: TalentProfile;
  isOwner?: boolean;
  onEditSection?: () => void;
  className?: string;
}

function VisibleSection({
  sectionKey,
  isOwner,
  profile,
  children,
}: {
  sectionKey: string;
  isOwner?: boolean;
  profile: TalentProfile;
  children: React.ReactNode;
}) {
  if (isOwner) return <>{children}</>;
  if (sectionKey === "bio") return <>{children}</>;
  if (profile.section_visibility?.[sectionKey as keyof typeof profile.section_visibility] === false) {
    return null;
  }
  return <>{children}</>;
}

function EmptyValue() {
  return <span className="text-sm text-text-muted italic">Not added yet</span>;
}

function Field({ label, value, fullWidth }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
  const isEmpty = value === DASH || value === null || value === undefined || value === "";
  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <p className="text-[10px] uppercase tracking-[0.06em] text-text-secondary font-medium mb-0.5">{label}</p>
      <div className="text-[13px] text-text-primary break-words">
        {isEmpty ? <EmptyValue /> : value}
      </div>
    </div>
  );
}

function Pills({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <EmptyValue />;
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

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="border-t-[2px] border-t-brand-muted overflow-hidden">
      <div className="flex items-center justify-between px-3.5 sm:px-4 pt-3 pb-2">
        <h2 className="text-[11px] uppercase tracking-[0.08em] font-medium text-brand-hover">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      <CardContent className="px-3.5 sm:px-4 pb-3.5 pt-0">
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

export function ProfileDetail({ profile, isOwner, onEditSection, className }: ProfileDetailProps) {
  const loc = formatLocation([
    profile.location?.city,
    profile.location?.state,
    profile.location?.country,
  ]);

  const phys = profile.physical_attributes;
  const docs = profile.documents;
  const socials = profile.social_links;

  const editAction = onEditSection ? (
    <button
      onClick={onEditSection}
      className="inline-flex items-center gap-1 text-[11px] text-brand hover:text-brand-hover transition-colors"
    >
      <Pencil className="w-3 h-3" strokeWidth={1.5} />
      Edit
    </button>
  ) : undefined;

  return (
    <div className={className ?? "space-y-2.5"}>
      <VisibleSection sectionKey="bio" isOwner={isOwner} profile={profile}>
        <Section title="Identity" action={editAction}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 gap-x-4">
            <Field label="Full legal name" value={showStr(profile.full_legal_name)} />
            <Field label="Date of birth" value={formatDob(profile.date_of_birth)} />
            <Field label="Gender" value={titleCase(profile.gender)} />
            <Field label="Username" value={profile.username ? `@${profile.username}` : DASH} />
            <Field label="Email" value={showStr(profile.email)} />
            <Field label="Phone" value={showStr(profile.phone)} />
          </div>
          {profile.headline && (
            <p className="text-[13px] text-text-secondary mt-3">{profile.headline}</p>
          )}
          {profile.about && (
            <p className="text-[13px] text-text-secondary mt-2 whitespace-pre-wrap break-words">{profile.about}</p>
          )}
        </Section>
      </VisibleSection>

      <VisibleSection sectionKey="location" isOwner={isOwner} profile={profile}>
        <Section title="Location" action={editAction}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 gap-x-4">
            <Field label="Country" value={showStr(profile.location?.country)} />
            <Field label="State" value={showStr(profile.location?.state)} />
            <Field label="City" value={showStr(profile.location?.city)} fullWidth />
          </div>
          {loc && <p className="text-[13px] text-text-muted mt-2">{loc}</p>}
        </Section>
      </VisibleSection>

      <VisibleSection sectionKey="experience" isOwner={isOwner} profile={profile}>
        <Section title="Career" action={editAction}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 gap-x-4">
            <Field label="Professions" value={<Pills items={profile.professions} />} />
            <Field label="Availability" value={titleCase(profile.availability)} />
            <Field label="Industries" value={<Pills items={profile.industries} />} fullWidth />
          </div>
        </Section>
      </VisibleSection>

      <VisibleSection sectionKey="skills" isOwner={isOwner} profile={profile}>
        <Section title="Skills" action={editAction}>
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
            <EmptyValue />
          )}
        </Section>
      </VisibleSection>

      <VisibleSection sectionKey="languages" isOwner={isOwner} profile={profile}>
        <Section title="Languages" action={editAction}>
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
            <EmptyValue />
          )}
        </Section>
      </VisibleSection>

      <VisibleSection sectionKey="accents" isOwner={isOwner} profile={profile}>
        <Section title="Accents" action={editAction}>
          <Pills items={profile.accents} />
        </Section>
      </VisibleSection>

      <VisibleSection sectionKey="physical_attributes" isOwner={isOwner} profile={profile}>
        <Section title="Physical attributes" action={editAction}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 gap-x-4">
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
      </VisibleSection>

      <VisibleSection sectionKey="documents" isOwner={isOwner} profile={profile}>
        <Section title="Documents" action={editAction}>
          <div className="space-y-2.5">
            <DocLink label="Resume" url={docs?.resume_url} />
            <DocLink label="Portfolio PDF" url={docs?.portfolio_pdf_url} />
            <DocLink label="Measurements sheet" url={docs?.measurements_sheet_url} />
          </div>
        </Section>
      </VisibleSection>

      <VisibleSection sectionKey="social_links" isOwner={isOwner} profile={profile}>
        <Section title="Social links" action={editAction}>
          <div className="space-y-2.5">
            {(["instagram", "youtube", "linkedin"] as const).map((platform) => {
              const link = socials?.[platform];
              return (
                <div key={platform} className="flex items-center justify-between gap-3">
                  <span className="text-text-tertiary capitalize text-[13px]">{platform}</span>
                  <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                    {link?.url ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-hover hover:underline truncate text-[13px]"
                      >
                        {link.url}
                      </a>
                    ) : (
                      <EmptyValue />
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
      </VisibleSection>

      {isOwner && (
        <Section title="Privacy" action={editAction}>
          <Field label="Profile visibility" value={titleCase(profile.privacy_mode)} />
        </Section>
      )}
    </div>
  );
}
