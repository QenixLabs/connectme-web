"use client";

import {
  Briefcase,
  Heart,
  Calendar,
  Eye,
  Users,
  TrendingUp,
} from "lucide-react";
import type { ComponentType } from "react";
import type { MockStats } from "@/lib/mocks/public-profile";

const STAT_DEFS: {
  key: keyof MockStats;
  icon: ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { key: "projects_completed", icon: Briefcase, label: "Projects Completed" },
  { key: "happy_clients", icon: Heart, label: "Happy Clients" },
  { key: "years_experience", icon: Calendar, label: "Years of Experience" },
  { key: "profile_views", icon: Eye, label: "Profile Views" },
  { key: "shortlist_count", icon: Users, label: "Shortlist Count" },
];

interface StatsBandProps {
  stats: MockStats;
}

export function StatsBand({ stats }: StatsBandProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-amber p-5 text-primary-foreground shadow-elevated">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {STAT_DEFS.map((s) => {
          const Icon = s.icon;
          const value = stats[s.key];
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs opacity-80">{s.label}</div>
                <div className="text-lg font-bold">
                  {typeof value === "number" ? `${value}+` : value}
                </div>
              </div>
            </div>
          );
        })}
        <div className="hidden items-center justify-end md:flex">
          <TrendingUp className="h-8 w-8 opacity-70" />
        </div>
      </div>
    </div>
  );
}
