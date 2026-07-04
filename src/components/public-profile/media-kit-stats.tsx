"use client";

import { Eye } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
}

interface MediaKitStatsProps {
  instagramFollowers: number;
  youtubeSubscribers: number;
  avgMonthlyViews: number;
  hasInstagramLink: boolean;
  hasYoutubeLink: boolean;
}

export function MediaKitStats({
  instagramFollowers,
  youtubeSubscribers,
  avgMonthlyViews,
  hasInstagramLink,
  hasYoutubeLink,
}: MediaKitStatsProps) {
  const stats: Stat[] = [];

  if (hasInstagramLink) {
    stats.push({
      icon: <FaInstagram className="w-4 h-4 mx-auto" />,
      value: formatCount(instagramFollowers),
      label: "Followers",
    });
  }

  if (hasYoutubeLink) {
    stats.push({
      icon: <FaYoutube className="w-4 h-4 mx-auto" />,
      value: formatCount(youtubeSubscribers),
      label: "Subscribers",
    });
  }

  stats.push({
    icon: <Eye className="w-4 h-4 mx-auto" strokeWidth={1.5} />,
    value: formatCount(avgMonthlyViews),
    label: "Views",
  });

  if (stats.length === 0) return null;

  const isScrollable = stats.length > 3;

  return (
    <section className="px-4 mt-5">
      {isScrollable ? (
        <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
          <div className="flex gap-3 min-w-max">
            {stats.map((s) => (
              <div
                key={s.label}
                className="w-[140px] shrink-0 bg-card border border-border rounded-2xl p-4 text-center"
              >
                <div className="text-gold mb-1.5">{s.icon}</div>
                <p className="text-xl font-bold text-text-primary">
                  {s.value}
                </p>
                <p className="text-xs text-text-tertiary mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="grid gap-3 bg-card border border-border rounded-2xl overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="p-4 text-center"
              style={i < stats.length - 1 ? { borderRight: "1px solid var(--border, oklch(0.87 0.01 80))" } : undefined}
            >
              <div className="text-gold mb-1.5">{s.icon}</div>
              <p className="text-xl font-bold text-text-primary">
                {s.value}
              </p>
              <p className="text-xs text-text-tertiary mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
