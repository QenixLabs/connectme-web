"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

const MOCK_OPPORTUNITIES = [
  {
    id: "1",
    title: "Lead Actor - Web Series",
    company: "Netstream Originals",
    location: "Mumbai",
    roleType: "Actor",
    budget: "₹2-5L",
    postedAt: "2 days ago",
    matchPercent: 94,
  },
  {
    id: "2",
    title: "Brand Ambassador - Fashion",
    company: "Pledia",
    location: "Delhi",
    roleType: "Model",
    budget: "₹1-3L",
    postedAt: "3 days ago",
    matchPercent: 87,
  },
  {
    id: "3",
    title: "Voice Over Artist - Ad Film",
    company: "AudioCraft Studios",
    location: "Remote",
    roleType: "Voice Artist",
    budget: "₹50K-1L",
    postedAt: "5 days ago",
    matchPercent: 82,
  },
];

const MOCK_COACHING = [
  {
    title: "Add 3 work images",
    description: "Profiles with 5+ images get 3x more views from recruiters",
    action: "Update Portfolio",
    urgency: "high" as const,
  },
  {
    title: "Record your intro video",
    description: "Intro videos improve shortlist chances by 40%",
    action: "Record Now",
    urgency: "medium" as const,
  },
  {
    title: "Verify your identity",
    description: "Get the verified badge to unlock messaging from all recruiters",
    action: "Start Verification",
    urgency: "high" as const,
  },
];

const MOCK_STATS = {
  profileViews7d: 128,
  profileViews30d: 456,
  shortlists: 12,
  messages: 3,
};

export default function TalentDashboardPage() {
  const { user } = useAuthStore();
  const firstName = user!.email.split("@")[0];
  const greeting = getGreeting();
  const verificationTier = user.verification_tier || 1;
  const isVerified = verificationTier >= 2;

  return (
    <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s what&apos;s happening with your career today
          </p>
        </div>

        {/* Verification Banner */}
        {!isVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-amber-600"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8 1l2.5 4.5L15 6l-3.5 3.5L12.5 14 8 11.5 3.5 14l1-4.5L1 6l4.5-.5L8 1z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">
                Complete your identity verification
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified talent get 5x more profile views and direct messages
                from recruiters
              </p>
            </div>
            <button className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors flex-shrink-0">
              Verify
            </button>
          </div>
        )}

        {isVerified && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
            <svg
              className="w-3.5 h-3.5 text-emerald-600"
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
            <span className="text-xs font-medium text-emerald-700">
              Identity Verified
            </span>
          </div>
        )}

        {/* Career Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="7d Views" value={MOCK_STATS.profileViews7d} />
          <StatCard label="30d Views" value={MOCK_STATS.profileViews30d} />
          <StatCard label="Shortlists" value={MOCK_STATS.shortlists} />
          <StatCard label="Messages" value={MOCK_STATS.messages} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/talent/profile"
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L6 10 4 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Edit Profile
          </Link>
          <Link
            href="#"
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2C4.5 2 2 4.5 2 8s2.5 6 6 6M8 2c3 0 5.5 2.5 5.5 6M8 2v12"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            View Public Profile
          </Link>
        </div>

        {/* Opportunities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Opportunities for You
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Matched based on your profile
              </p>
            </div>
            <Link
              href="#"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_OPPORTUNITIES.map((opp) => (
              <div
                key={opp.id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {opp.title}
                      </h3>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full flex-shrink-0">
                        {opp.matchPercent}% match
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {opp.company} · {opp.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {opp.roleType}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {opp.budget}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{opp.postedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Best Actions */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Recommended Next Steps
          </h2>
          <div className="space-y-3">
            {MOCK_COACHING.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.urgency === "high"
                      ? "bg-amber-50"
                      : "bg-slate-50"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 ${
                      item.urgency === "high"
                        ? "text-amber-500"
                        : "text-slate-500"
                    }`}
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M8 2v6M8 12v.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
                <button className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0">
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Note */}
        <div className="bg-slate-900 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-amber-400"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M8 2l6 3v4c0 3.5-2.5 6-6 7-3.5-1-6-3.5-6-7V5l6-3z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path
                d="M6 8l2 2 3-3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Only verified recruiters can contact you
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              We verify every recruiter before they can message or shortlist
              talent. If you receive suspicious messages, report them
              immediately.
            </p>
          </div>
        </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
