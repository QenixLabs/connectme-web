"use client";

import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import type { MediaKitData } from "@/types/media-kit";

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

interface MediaKitPaneProps {
  profile: TalentProfile;
  mediaKit: MediaKitData | null;
}

export function MediaKitPane({ profile, mediaKit }: MediaKitPaneProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const socialEntries = Object.entries(profile.social_links ?? {}).filter(
    ([, link]) => link?.url && link?.show_on_profile === true,
  );

  const docs = [
    {
      icon: FileText,
      title: "Résumé / CV",
      key: "resume_url" as const,
    },
    {
      icon: LayoutGrid,
      title: "Portfolio",
      key: "portfolio_pdf_url" as const,
    },
    {
      icon: Ruler,
      title: "Measurements Sheet",
      key: "measurements_sheet_url" as const,
    },
  ].filter((d) => profile.documents?.[d.key]);

  return (
    <div className="space-y-6">
      {socialEntries.length > 0 && (
        <Card className="border-border shadow-card">
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-bold text-foreground">Social</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {socialEntries.map(([platform, link]) => {
                const Icon = PLATFORM_ICON_MAP[platform] ?? Link;
                const label = platformLabel(platform);
                const url = link!.url ?? "";
                return (
                  <a
                    key={platform}
                    href={url.startsWith("http") ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-border bg-background/60 p-3 text-left transition active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-soft">
                        <Icon className="h-4 w-4 text-amber-foreground" />
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {label}
                    </div>
                    <div className="truncate text-[13px] font-medium text-foreground">
                      {url
                        .replace(/^https?:\/\//, "")
                        .replace(/^www\./, "")}
                    </div>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {docs.length > 0 && (
        <Card className="border-border shadow-card">
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Documents
            </h2>
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
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/60 px-3.5 py-3 transition active:scale-[0.99]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-soft">
                      <d.icon className="h-4 w-4 text-amber-foreground" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="truncate text-[13.5px] font-medium text-foreground">
                        {d.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        PDF
                      </div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
                      <Download className="h-4 w-4 text-amber" />
                    </div>
                    <ChevronRight className="-ml-1 h-4 w-4 text-muted-foreground" />
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
