"use client";

import {
  ExternalLink,
  FileText,
  LayoutGrid,
  Ruler,
  Download,
  ChevronRight,
  Globe,
  Link,
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
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

interface LinksPaneProps {
  profile: TalentProfile;
  showSocial?: boolean;
  showDocuments?: boolean;
}

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

export function LinksPane({ profile, showSocial = true, showDocuments = true }: LinksPaneProps) {
  const socialEntries = Object.entries(profile.social_links ?? {}).filter(
    ([, link]) => link?.url
  );

  const docs = [
    { icon: FileText, title: "Résumé / CV", key: "resume_url" as const },
    { icon: LayoutGrid, title: "Portfolio", key: "portfolio_pdf_url" as const },
    { icon: Ruler, title: "Measurements Sheet", key: "measurements_sheet_url" as const },
  ];

  const visibleSocials = socialEntries;

  return (
    <>
      {showSocial && visibleSocials.length > 0 && (
        <Card label="Social">
          <div className="grid grid-cols-2 gap-2.5">
            {visibleSocials.map(([platform, link]) => {
              const Icon = PLATFORM_ICON_MAP[platform] ?? Link;
              const label = platformLabel(platform);
              const url = link!.url ?? "";
              return (
                <a
                  key={platform}
                  href={url.startsWith("http") ? url : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-left rounded-xl bg-cream/70 border border-border/60 p-3 active:scale-[0.99] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-gold-soft grid place-items-center">
                      <Icon className="h-4 w-4 text-gold-ink" />
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-ink-muted" />
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-ink-muted">{label}</div>
                  <div className="text-[13px] font-medium text-ink truncate">{url.replace(/^https?:\/\//, "").replace(/^www\./, "")}</div>
                </a>
              );
            })}
          </div>
        </Card>
      )}

      {showDocuments && (
        <Card label="Documents">
          <div className="space-y-2">
            {docs.map((d) => {
              const url = profile.documents?.[d.key];
              if (!url) return null;
              return (
                <a
                  key={d.key}
                  href={url.startsWith("http") ? url : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 rounded-xl bg-cream/70 border border-border/60 px-3.5 py-3 active:scale-[0.99] transition"
                >
                  <div className="h-10 w-10 rounded-xl bg-gold-soft grid place-items-center">
                    <d.icon className="h-4 w-4 text-gold-ink" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-[13.5px] font-medium text-ink truncate">{d.title}</div>
                    <div className="text-[11px] text-ink-muted">PDF</div>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-card border border-border grid place-items-center"
                  >
                    <Download className="h-4 w-4 text-gold" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-muted -ml-1" />
                </a>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}

function Card({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-luxe">
      {label && (
        <div className="flex items-center justify-between px-5 pt-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">{label}</p>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
