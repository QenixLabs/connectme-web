"use client";

import Link from "next/link";
import { Check, Plus, Search, Crosshair } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getGreeting } from "@/lib/greeting";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Card } from "@/components/ui/card";

const MOCK_TALENT = [
  {
    id: "1",
    name: "Ananya Kapoor",
    profession: "Actress",
    location: "Mumbai",
    matchPercent: 89,
    verified: true,
    avatar: null,
  },
  {
    id: "2",
    name: "Ishaan Verma",
    profession: "Actor",
    location: "Delhi",
    matchPercent: 92,
    verified: true,
    avatar: null,
  },
  {
    id: "3",
    name: "Priya Malhotra",
    profession: "Model",
    location: "Bangalore",
    matchPercent: 84,
    verified: true,
    avatar: null,
  },
  {
    id: "4",
    name: "Rohit Sinha",
    profession: "Film Director",
    location: "Mumbai",
    matchPercent: 76,
    verified: true,
    avatar: null,
  },
];

const MOCK_STATS = {
  activeProjects: 18,
  shortlistedTalent: 24,
  messages: 5,
};

export default function RecruiterDashboardPage() {
  const { user } = useAuthStore();
  const firstName = user!.email.split("@")[0];
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting}, {firstName}
        </h1>
        <div className="mt-2">
          <VerifiedBadge label="Verified Recruiter" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Active Projects" value={MOCK_STATS.activeProjects} align="left" />
        <StatCard label="Shortlisted Talent" value={MOCK_STATS.shortlistedTalent} align="left" />
        <StatCard label="Messages" value={MOCK_STATS.messages} align="left" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="#"
          className="flex items-center justify-center gap-2 h-11 rounded-xl bg-surface-dark text-on-surface-dark text-sm font-medium hover:bg-surface-darker active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Post Campaign
        </Link>
        <Link
          href="/recruiter/find-talent"
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-page active:scale-[0.98] transition-all"
        >
          <Search className="w-4 h-4" strokeWidth={1.2} />
          Search Talent
        </Link>
      </div>

      {/* Recommended Talent */}
      <div>
        <SectionHeader
          title="Recommended Talent for You"
          subtitle="Only verified talent shown"
        />

        <div className="grid grid-cols-2 gap-3">
          {MOCK_TALENT.map((talent) => (
            <Card
              key={talent.id}
              className="rounded-2xl overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div className="relative h-36 bg-surface-light">
                <div className="absolute inset-0 flex items-center justify-center text-3xl">
                  {talent.avatar ? (
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-text-muted">👤</span>
                  )}
                </div>
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-brand text-on-brand text-xs font-bold rounded-md">
                  {talent.matchPercent}%
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-text-primary truncate">
                    {talent.name}
                  </h3>
                  {talent.verified && (
                    <Check className="w-3.5 h-3.5 text-success flex-shrink-0" strokeWidth={1.5} />
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {talent.profession} · {talent.location}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-surface-lightest border border-border rounded-full">
                  <Check className="w-3 h-3 text-brand" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-text-secondary">
                    {talent.matchPercent}% Match
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="p-5">
        <SectionHeader title="Recent Activity" />
        <div className="space-y-3">
          {[
            {
              text: "Ananya Kapoor accepted your connection request",
              time: "2h ago",
            },
            {
              text: "New application received for 'Lead Actor - Web Series'",
              time: "5h ago",
            },
            {
              text: "Shortlist 'Mumbai Models' updated with 3 new talents",
              time: "1d ago",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 pb-3 border-b border-border-subtle last:border-0 last:pb-0"
            >
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
                <Crosshair className="w-4 h-4 text-brand" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-secondary">{item.text}</p>
                <p className="text-xs text-text-muted mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
