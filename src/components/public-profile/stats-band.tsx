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

interface StatsValue {
  label: string;
  icon: ComponentType<{ className?: string }>;
  value: string | number;
}

function formatViews(n?: number): string {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

interface StatsBandProps {
  projectsCompleted?: number;
  happyClients?: number;
  yearsExperience?: number;
  profileViews30d?: number;
  shortlistCount?: number;
}

export function StatsBand({
  projectsCompleted = 0,
  happyClients = 0,
  yearsExperience = 0,
  profileViews30d = 0,
  shortlistCount = 0,
}: StatsBandProps) {
  const statEntries: StatsValue[] = [
    { label: "Projects Completed", icon: Briefcase, value: `${projectsCompleted}+` },
    { label: "Happy Clients", icon: Heart, value: `${happyClients}+` },
    { label: "Years of Experience", icon: Calendar, value: `${yearsExperience}+` },
    { label: "Profile Views", icon: Eye, value: formatViews(profileViews30d) },
    { label: "Shortlist Count", icon: Users, value: `${shortlistCount}+` },
  ];

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-amber p-5 text-primary-foreground shadow-elevated">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {statEntries.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs opacity-80">{s.label}</div>
                <div className="text-lg font-bold">{s.value}</div>
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
