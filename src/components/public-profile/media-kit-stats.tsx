"use client";

import { Eye } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel?: string;
  live?: boolean;
  loading?: boolean;
  href?: string;
}

interface MediaKitStatsProps {
  instagramFollowers?: number;
  youtubeSubscribers?: number;
  youtubeViews?: number;
  monthlyViews: number;
  hasInstagramLink: boolean;
  hasYoutubeLink: boolean;
  instagramUrl?: string;
  youtubeUrl?: string;
  instagramLoading?: boolean;
  youtubeLoading?: boolean;
}

export function MediaKitStats({
  instagramFollowers,
  youtubeSubscribers,
  youtubeViews,
  monthlyViews,
  hasInstagramLink,
  hasYoutubeLink,
  instagramUrl,
  youtubeUrl,
  instagramLoading = false,
  youtubeLoading = false,
}: MediaKitStatsProps) {
  const stats: Stat[] = [];

  if (hasInstagramLink && (instagramLoading || (instagramFollowers != null && instagramFollowers > 0))) {
    stats.push({
      icon: <FaInstagram className="w-4 h-4 mx-auto" />,
      value: instagramLoading ? "" : formatCount(instagramFollowers ?? 0),
      label: "Followers",
      live: !instagramLoading && instagramFollowers != null,
      loading: instagramLoading,
      href: instagramUrl,
    });
  }

  if (hasYoutubeLink) {
    stats.push({
      icon: <FaYoutube className="w-4 h-4 mx-auto" />,
      value: youtubeLoading ? "" : formatCount(youtubeSubscribers ?? 0),
      label: "Subscribers",
      sublabel: youtubeViews != null && !youtubeLoading
        ? `${formatCount(youtubeViews)} views`
        : undefined,
      live: !youtubeLoading && youtubeSubscribers != null,
      loading: youtubeLoading,
      href: youtubeUrl,
    });
  }

  if (monthlyViews > 0 || !hasInstagramLink && !hasYoutubeLink) {
    stats.push({
      icon: <Eye className="w-4 h-4 mx-auto" strokeWidth={1.5} />,
      value: formatCount(monthlyViews),
      label: "Monthly Views",
    });
  }

  if (stats.length === 0) return null;

  const isScrollable = stats.length > 3;

  return (
    <section className="px-4 mt-5">
      {isScrollable ? (
        <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
          <div className="flex gap-3 min-w-max">
            {stats.map((s) => (
              <StatCard key={s.label} stat={s} />
            ))}
          </div>
        </div>
      ) : (
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
      )}
    </section>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="w-[140px] shrink-0 bg-card border border-border rounded-2xl p-4 text-center">
      <StatCardInner stat={stat} />
    </div>
  );
}

function StatCardInner({ stat }: { stat: Stat }) {
  const content = (
    <>
      <div className="relative inline-flex items-center justify-center text-gold mb-1.5">
        {stat.icon}
        {stat.live && (
          <span className="absolute -top-1 -right-3 flex items-center gap-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>
        )}
      </div>
      {stat.loading ? (
        <Skeleton className="h-6 w-14 mx-auto" />
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
