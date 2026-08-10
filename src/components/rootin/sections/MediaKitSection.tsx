"use client";

import { FileText, ExternalLink, Instagram, Youtube, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, SectionHead, EmptyState } from "../primitives";
import type { TalentProfile } from "@/lib/api/talent";

const socialIcons: Record<string, React.ComponentType<{ width?: number; height?: number; className?: string }>> = {
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
};

function formatSocialName(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

export interface MediaKitSectionProps {
  profile: TalentProfile;
  className?: string;
}

export function MediaKitSection({ profile, className }: MediaKitSectionProps) {
  const documents = profile.documents;
  const socialLinks = profile.social_links;

  const docItems = [
    { label: "Resume", url: documents?.resume_url },
    { label: "Portfolio PDF", url: documents?.portfolio_pdf_url },
    { label: "Measurements Sheet", url: documents?.measurements_sheet_url },
  ].filter((d) => !!d.url);

  const socialItems = socialLinks
    ? Object.entries(socialLinks).filter(([, v]) => v.url && v.show_on_profile !== false)
    : [];

  const isEmpty = docItems.length === 0 && socialItems.length === 0;

  return (
    <Card className={cn("transition-all duration-300 ease-out", className)}>
      <SectionHead icon={<FileText width={16} height={16} />} title="Media Kit" />
      {isEmpty ? (
        <EmptyState icon={<FileText width={32} height={32} />} message="No media kit items available." />
      ) : (
        <div className="space-y-4">
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
                    className="flex items-center gap-3 rounded-xl border bg-surface p-3 transition-all duration-200 hover:-translate-y-px hover:bg-surface/90"
                    style={{ borderColor: "var(--border-card)" }}
                  >
                    <FileText width={16} height={16} className="shrink-0 text-accent/50" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground/80">
                      {doc.label}
                    </span>
                    <ExternalLink width={14} height={14} className="shrink-0 text-muted-foreground/40" />
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
                      className="flex items-center gap-3 rounded-xl border bg-surface p-3 transition-all duration-200 hover:-translate-y-px hover:bg-surface/90"
                      style={{ borderColor: "var(--border-card)" }}
                    >
                      <Icon width={16} height={16} className="shrink-0 text-accent/50" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground/80">
                        {formatSocialName(key)}
                      </span>
                      <ExternalLink width={14} height={14} className="shrink-0 text-muted-foreground/40" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
