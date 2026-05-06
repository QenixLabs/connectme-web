"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

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
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light border border-brand-muted rounded-full">
            <svg
              className="w-3.5 h-3.5 text-brand"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs font-medium text-brand-hover">
              Verified Recruiter
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Active Projects"
            value={MOCK_STATS.activeProjects}
          />
          <StatCard
            label="Shortlisted Talent"
            value={MOCK_STATS.shortlistedTalent}
          />
          <StatCard label="Messages" value={MOCK_STATS.messages} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="#"
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-surface-dark text-white text-sm font-medium hover:bg-surface-darker active:scale-[0.98] transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v12M2 8h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Post Campaign
          </Link>
          <Link
            href="#"
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-page active:scale-[0.98] transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <circle
                cx="7"
                cy="7"
                r="5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M11 11l3 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            Search Talent
          </Link>
        </div>

        {/* Recommended Talent */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Recommended Talent for You
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                Only verified talent shown
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {MOCK_TALENT.map((talent) => (
              <div
                key={talent.id}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-sm transition-shadow"
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
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-brand text-white text-xs font-bold rounded-md">
                    {talent.matchPercent}%
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-text-primary truncate">
                      {talent.name}
                    </h3>
                    {talent.verified && (
                      <svg
                        className="w-3.5 h-3.5 text-success flex-shrink-0"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {talent.profession} · {talent.location}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-surface-lightest border border-border rounded-full">
                    <svg
                      className="w-3 h-3 text-brand"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-xs font-medium text-text-secondary">
                      {talent.matchPercent}% Match
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            Recent Activity
          </h2>
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
                  <svg
                    className="w-4 h-4 text-brand"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 2v1M8 13v1M2 8h1M13 8h1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-secondary">{item.text}</p>
                  <p className="text-xs text-text-muted mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-xs text-text-muted leading-tight">{label}</p>
      <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
