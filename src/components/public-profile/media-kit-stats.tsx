"use client";

import { Eye, Globe } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
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

interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel?: string;
  live?: boolean;
  loading?: boolean;
  href?: string;
  compact?: boolean;
}

interface SocialLinkData {
  url?: string;
  visibility?: string;
  show_on_profile?: boolean;
}

interface MediaKitStatsProps {
  instagramFollowers?: number;
  youtubeSubscribers?: number;
  youtubeViews?: number;
  monthlyViews: number;
  instagramLoading?: boolean;
  youtubeLoading?: boolean;
  socialLinks?: Record<string, SocialLinkData>;
}

export function MediaKitStats({
  instagramFollowers,
  youtubeSubscribers,
  youtubeViews,
  monthlyViews,
  instagramLoading = false,
  youtubeLoading = false,
  socialLinks,
}: MediaKitStatsProps) {
  const stats: Stat[] = [];

  const links = Object.entries(socialLinks ?? {}).filter(
    ([, link]) => link?.url && link?.show_on_profile === true,
  );

  for (const [platform, link] of links) {
    const url = link.url!;
    if (platform === "instagram") {
      stats.push({
        icon: <FaInstagram className="w-4 h-4 mx-auto" />,
        value: instagramLoading ? "" : formatCount(instagramFollowers ?? 0),
        label: "Followers",
        live: !instagramLoading && instagramFollowers != null,
        loading: instagramLoading || instagramFollowers == null,
        href: url,
      });
    } else if (platform === "youtube") {
      stats.push({
        icon: <FaYoutube className="w-4 h-4 mx-auto" />,
        value: youtubeLoading ? "" : formatCount(youtubeSubscribers ?? 0),
        label: "Subscribers",
        sublabel:
          youtubeViews != null && !youtubeLoading
            ? `${formatCount(youtubeViews)} views`
            : undefined,
        live: !youtubeLoading && youtubeSubscribers != null,
        loading: youtubeLoading,
        href: url,
      });
    } else {
      const IconComponent = PLATFORM_ICON_MAP[platform] ?? Globe;
      stats.push({
        icon: <IconComponent className="w-4 h-4 mx-auto" />,
        value: platformLabel(platform),
        label: "Profile",
        href: url,
        compact: true,
      });
    }
  }

  stats.push({
    icon: <Eye className="w-4 h-4 mx-auto" strokeWidth={1.5} />,
    value: formatCount(monthlyViews),
    label: "Monthly Views",
  });

  if (stats.length === 0) return null;

  return (
    <section className="px-4 mt-5">
      <div
        className="grid gap-0 bg-card border border-border rounded-2xl overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="p-4 text-center"
            style={
              i < stats.length - 1
                ? { borderRight: "2px solid var(--border, oklch(0.87 0.01 80))" }
                : undefined
            }
          >
            <StatCardInner stat={s} />
          </div>
        ))}
      </div>
    </section>
  );
}

function StatCardInner({ stat }: { stat: Stat }) {
  const content = (
    <>
      <div className="relative inline-flex items-center justify-center text-gold mb-1.5">
        {stat.icon}
        {(stat.live || stat.loading) && (
          <span className="absolute -top-1 -right-3 flex items-center gap-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>
        )}
      </div>
      {stat.loading ? (
        <Skeleton className="h-6 w-14 mx-auto rounded-md" />
      ) : stat.compact ? (
        <p className="text-sm font-semibold text-text-primary leading-tight">
          {stat.value}
        </p>
      ) : (
        <p className="text-xl font-bold text-text-primary">{stat.value}</p>
      )}
      <p className="text-xs text-text-tertiary mt-1">{stat.label}</p>
      {stat.sublabel && !stat.loading && (
        <p className="text-[10px] text-text-tertiary/70 mt-0.5">{stat.sublabel}</p>
      )}
    </>
  );

  if (stat.href) {
    return (
      <a
        href={stat.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-80 transition-opacity"
      >
        {content}
      </a>
    );
  }

  return content;
}
