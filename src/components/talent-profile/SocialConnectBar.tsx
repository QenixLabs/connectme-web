"use client";

import { useMemo, useState } from "react";
import { FaLinkedinIn } from "react-icons/fa6";
import { Ellipsis, Globe, Link2 } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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

function SocialIcon({ platform, className }: { platform: string; className: string }) {
  const entry = socialIcons[platform];

  if (entry && "icon" in entry) {
    return <BrandIcon icon={entry.icon} className={className} />;
  }

  if (entry && "component" in entry) {
    return <entry.component className={className} style={{ color: entry.color }} />;
  }

  if (platform === "website") {
    return <Globe className={className} />;
  }

  return <Link2 className={className} />;
}

function formatPlatformName(key: string): string {
  if (key === "twitter") return "X";
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

export function SocialConnectBar({ profile }: { profile: TalentProfile }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const socialLinks = profile.social_links;

  const validEntries = useMemo(() => {
    if (!socialLinks) return [];

    return Object.entries(socialLinks)
      .filter(([, v]) => v.show_on_profile !== false)
      .map(([key, v]) => [key, normalizeUrl(v.url)] as const)
      .filter((entry): entry is readonly [string, string] => entry[1] !== null);
  }, [socialLinks]);

  if (!socialLinks || validEntries.length === 0) return null;

  const linksByKey = new Map(validEntries);
  const remainingEntries = validEntries.filter(
    ([key]) => key !== "instagram" && key !== "youtube" && key !== "website",
  );
  const primaryItems = [
    {
      key: "instagram",
      label: "Instagram",
      tileClass: "bg-[#f8e7f3] text-[#d62976]",
    },
    {
      key: "youtube",
      label: "YouTube",
      tileClass: "bg-[#fde8e8] text-[#e21b23]",
    },
    {
      key: "website",
      label: "Website",
      tileClass: "bg-[#e6f0ff] text-[#3674d9]",
    },
  ];

  return (
    <>
      <section className="flex w-full items-start justify-around rounded-[20px] bg-card/95 px-3 py-1.5 shadow-[0_6px_24px_rgba(15,23,42,0.05)]">
        {primaryItems
          .filter(({ key }) => linksByKey.has(key))
          .map(({ key, label, tileClass }) => {
            const url = linksByKey.get(key);
            if (!url) return null;

            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${label}`}
                className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1 transition-colors hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                   <span className={`grid size-10 place-items-center rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.06)] ${tileClass}`}>
                  <SocialIcon platform={key} className="size-6" />
                </span>
                <span className="text-[11px] font-semibold leading-4 text-[#1c274c]">{label}</span>
              </a>
            );
          })}

        {remainingEntries.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1 transition-colors hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open more social links"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-[#eef0ff] text-[#6874ba]">
              <Ellipsis className="size-6" />
            </span>
            <span className="text-[11px] font-semibold leading-4 text-[#1c274c]">More</span>
          </button>
        )}
      </section>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-8">
          <SheetHeader className="px-0 pt-5">
            <SheetTitle className="text-left text-base text-[#1c274c]">More social links</SheetTitle>
          </SheetHeader>
          {remainingEntries.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {remainingEntries.map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5 text-sm font-semibold text-[#1c274c] transition-colors hover:bg-surface/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-card">
                    <SocialIcon platform={key} className="size-5" />
                  </span>
                  <span className="truncate">{formatPlatformName(key)}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No other social links available.</p>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
