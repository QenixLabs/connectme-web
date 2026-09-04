"use client";

import {
  FaInstagram,
  FaYoutube,
  FaFacebookF,
  FaTiktok,
  FaLinkedinIn,
  FaPinterestP,
  FaSnapchat,
  FaTwitch,
  FaDiscord,
  FaBehance,
  FaDribbble,
  FaVimeoV,
  FaSpotify,
  FaXTwitter,
} from "react-icons/fa6";
import { Globe, Link2 } from "lucide-react";
import type { TalentProfile } from "@/lib/api/talent";

const socialIcons: Record<string, { Icon: React.ComponentType<{ className?: string }>; label: string }> = {
  instagram: { Icon: FaInstagram, label: "Instagram profile" },
  youtube: { Icon: FaYoutube, label: "YouTube channel" },
  facebook: { Icon: FaFacebookF, label: "Facebook profile" },
  linkedin: { Icon: FaLinkedinIn, label: "LinkedIn profile" },
  tiktok: { Icon: FaTiktok, label: "TikTok profile" },
  twitter: { Icon: FaXTwitter, label: "X (Twitter) profile" },
  pinterest: { Icon: FaPinterestP, label: "Pinterest profile" },
  snapchat: { Icon: FaSnapchat, label: "Snapchat profile" },
  twitch: { Icon: FaTwitch, label: "Twitch channel" },
  discord: { Icon: FaDiscord, label: "Discord" },
  behance: { Icon: FaBehance, label: "Behance profile" },
  dribbble: { Icon: FaDribbble, label: "Dribbble profile" },
  vimeo: { Icon: FaVimeoV, label: "Vimeo profile" },
  spotify: { Icon: FaSpotify, label: "Spotify" },
  website: { Icon: Globe, label: "Website" },
};

function normalizeUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // The profile editor saves URLs as typed (placeholders are bare domains),
  // so assume https:// when no scheme is present.
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
  if (!socialLinks) return null;

  const entries = Object.entries(socialLinks)
    .filter(([, v]) => v.show_on_profile !== false)
    .map(([key, v]) => [key, normalizeUrl(v.url)] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] !== null);

  if (entries.length === 0) return null;

  return (
    <section className="flex items-center justify-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
      {entries.map(([key, url]) => {
        const entry = socialIcons[key];
        const Icon = entry?.Icon ?? Link2;
        const label = entry?.label ?? `${key} profile`;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="grid size-9 place-items-center rounded-full bg-surface text-brand transition-all hover:scale-110"
          >
            <Icon className="size-4" />
          </a>
        );
      })}
    </section>
  );
}
