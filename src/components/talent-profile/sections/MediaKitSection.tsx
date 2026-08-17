"use client";

import { FileText, ExternalLink, Instagram, Youtube, Linkedin, Twitter } from "lucide-react";
import { GlassCard, SectionHeader } from "../primitives";
import type { TalentProfile } from "@/lib/api/talent";

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
};

function formatSocialName(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

export function MediaKitSection({ profile }: { profile: TalentProfile }) {
  const documents = profile.documents;
  const socialLinks = profile.social_links;

  const docItems = [
    { label: "Resume", url: documents?.resume_url },
    { label: "Portfolio PDF", url: documents?.portfolio_pdf_url },
    { label: "Measurements Sheet", url: documents?.measurements_sheet_url },
  ].filter((d): d is { label: string; url: string } => !!d.url);

  const socialItems = socialLinks
    ? Object.entries(socialLinks).filter(([, v]) => v.url && v.show_on_profile !== false)
    : [];

  const isEmpty = docItems.length === 0 && socialItems.length === 0;

  return (
    <GlassCard>
      <SectionHeader icon={<FileText className="size-4" />} title="Media Kit" />
      {isEmpty ? (
        <p className="py-8 text-center text-sm text-muted-foreground/60">
          No media kit items available.
        </p>
      ) : (
        <div className="space-y-5">
          {docItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
                Documents
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {docItems.map((doc) => (
                  <a
                    key={doc.label}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-inset flex items-center gap-3 rounded-xl p-3 transition-all hover:border-border-hover hover:bg-bg-surface"
                  >
                    <FileText className="size-4 shrink-0 text-primary/70" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground/85">
                      {doc.label}
                    </span>
                    <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/40" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {socialItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
                Social Links
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {socialItems.map(([key, link]) => {
                  const Icon = socialIcons[key] || ExternalLink;
                  return (
                    <a
                      key={key}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-inset flex items-center gap-3 rounded-xl p-3 transition-all hover:border-border-hover hover:bg-bg-surface"
                    >
                      <Icon className="size-4 shrink-0 text-primary/70" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground/85">
                        {formatSocialName(key)}
                      </span>
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/40" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
