"use client";

import { useMemo } from "react";
import { FaLinkedinIn } from "react-icons/fa6";
import { Globe, Link2 } from "lucide-react";
import {
  siInstagram,
  siYoutube,
  siFacebook,
  siTiktok,
  siPinterest,
  siSnapchat,
  siTwitch,
  siDiscord,
  siBehance,
  siDribbble,
  siVimeo,
  siSpotify,
  siX,
  type SimpleIcon,
} from "simple-icons/icons";
import type { TalentProfile } from "@/lib/api/talent";

function BrandIcon({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      fill={`#${icon.hex}`}
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  );
}

type IconEntry =
  | { icon: SimpleIcon; label: string }
  | {
      component: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
      color: string;
      label: string;
    };

const socialIcons: Record<string, IconEntry> = {
  instagram: { icon: siInstagram, label: "Instagram profile" },
  youtube: { icon: siYoutube, label: "YouTube channel" },
  facebook: { icon: siFacebook, label: "Facebook profile" },
  linkedin: { component: FaLinkedinIn, color: "#0A66C2", label: "LinkedIn profile" },
  tiktok: { icon: siTiktok, label: "TikTok profile" },
  twitter: { icon: siX, label: "X (Twitter) profile" },
  pinterest: { icon: siPinterest, label: "Pinterest profile" },
  snapchat: { icon: siSnapchat, label: "Snapchat profile" },
  twitch: { icon: siTwitch, label: "Twitch channel" },
  discord: { icon: siDiscord, label: "Discord profile" },
  behance: { icon: siBehance, label: "Behance profile" },
  dribbble: { icon: siDribbble, label: "Dribbble profile" },
  vimeo: { icon: siVimeo, label: "Vimeo profile" },
  spotify: { icon: siSpotify, label: "Spotify profile" },
};

function normalizeUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const withProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return withProtocol;
  } catch {
    return null;
  }
}

export function SocialConnectBar({ profile }: { profile: TalentProfile }) {
  const socialLinks = profile.social_links;

  const validEntries = useMemo(() => {
    if (!socialLinks) return [];

    return Object.entries(socialLinks)
      .filter(([, v]) => v.show_on_profile !== false)
      .map(([key, v]) => [key, normalizeUrl(v.url)] as const)
      .filter((entry): entry is readonly [string, string] => entry[1] !== null);
  }, [socialLinks]);

  if (!socialLinks || validEntries.length === 0) return null;

  return (
    <section className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card px-4 py-3 shadow-[var(--shadow-card)]">
      {validEntries.map(([key, url]) => {
        const entry = socialIcons[key];
        const label = entry?.label ?? `${key} profile`;

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="grid size-10 place-items-center rounded-full bg-surface transition-all duration-200 hover:scale-110 hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {entry && "icon" in entry ? (
              <BrandIcon icon={entry.icon} className="size-5" />
            ) : entry && "component" in entry ? (
              <entry.component className="size-5" style={{ color: entry.color }} />
            ) : key === "website" ? (
              <Globe className="size-5 text-brand" />
            ) : (
              <Link2 className="size-5 text-brand" />
            )}
          </a>
        );
      })}
    </section>
  );
}