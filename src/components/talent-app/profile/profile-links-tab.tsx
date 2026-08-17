"use client";

import { Link2, Globe, FileText, ExternalLink } from "lucide-react";

import { SectionCard } from "./profile-section-card";
import { InlineField } from "./inline-field";
import { SOCIAL_PLATFORMS } from "./profile-constants";
import type { TalentProfile } from "@/lib/api/talent";

interface ProfileLinksTabProps {
  profile: TalentProfile;
  onFieldUpdate: (field: string, value: unknown) => void;
}

export function ProfileLinksTab({ profile, onFieldUpdate }: ProfileLinksTabProps) {
  const socialLinks = profile.social_links ?? {};
  const documents = profile.documents ?? {};

  const documentFields: {
    key: keyof NonNullable<TalentProfile["documents"]>;
    label: string;
  }[] = [
    { key: "resume_url", label: "Resume URL" },
    { key: "portfolio_pdf_url", label: "Portfolio PDF URL" },
    { key: "measurements_sheet_url", label: "Measurements Sheet URL" },
  ];

  return (
    <div className="space-y-5 animate-in">
      <SectionCard icon={Link2} title="Social Links">
        <div className="space-y-3">
          {SOCIAL_PLATFORMS.map((platform) => {
            const link = socialLinks[platform];
            return (
              <div
                key={platform}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised p-3"
              >
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <InlineField
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    value={link?.url ?? ""}
                    onSave={(v) => {
                      const next = { ...socialLinks };
                      if (v) {
                        next[platform] = {
                          ...next[platform],
                          url: v,
                          visibility: "public",
                          show_on_profile: true,
                        };
                      } else {
                        delete next[platform];
                      }
                      onFieldUpdate("social_links", next);
                    }}
                    inputType="url"
                    placeholder={`https://${platform}.com/...`}
                  />
                </div>
                {link?.url && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Visit ${platform}`}
                  >
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard icon={FileText} title="Documents">
        <div className="space-y-3">
          {documentFields.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised p-3"
            >
              <div className="grid size-8 place-items-center rounded-lg bg-warning/10 text-warning">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <InlineField
                  label={label}
                  value={documents[key] ?? ""}
                  onSave={(v) =>
                    onFieldUpdate("documents", { ...documents, [key]: v })
                  }
                  inputType="url"
                  placeholder="https://..."
                />
              </div>
              {documents[key] && (
                <a
                  href={documents[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Open ${label}`}
                >
                  <ExternalLink className="size-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
