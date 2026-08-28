"use client";

import {
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Link2,
} from "lucide-react";
import type { TalentProfile } from "@/lib/api/talent";

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  linkedin: Linkedin,
};

export function SocialConnectBar({ profile }: { profile: TalentProfile }) {
  const socialLinks = profile.social_links;
  if (!socialLinks) return null;

  const entries = Object.entries(socialLinks).filter(
    ([, v]) => v.url && v.show_on_profile !== false,
  );

  if (entries.length === 0) return null;

  return (
    <section className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
      <span className="shrink-0 text-xs font-bold text-foreground">
        Connect
      </span>
      <div className="flex flex-1 items-center justify-around">
        {entries.map(([key, link]) => {
          const Icon = socialIcons[key] || Link2;
          return (
            <a
              key={key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-9 place-items-center rounded-full bg-surface text-brand transition-all hover:scale-110"
            >
              <Icon className="size-4" />
            </a>
          );
        })}
      </div>
    </section>
  );
}
