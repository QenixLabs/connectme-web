"use client";

import Link from "next/link";
import {
  Bell,
  User,
  Sun,
  Zap,
  BadgeCheck,
  CalendarDays,
  Bookmark,
  ClipboardList,
  Plus,
  Search,
  Briefcase,
  ArrowRight,
  Check,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useUnreadNotifications } from "@/hooks/use-unread-counts";
import {
  useRecruiterProfile,
  useRecruiterDashboardStats,
  useRecruiterSubscription,
  useRecruiterUsage,
  useDashboardTalentRecommendations,
} from "@/hooks/use-recruiter-dashboard";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "GOOD MORNING";
  if (hour < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

function getDisplayName(user: { email?: string; username?: string } | null) {
  if (!user?.username) return user?.email?.split("@")[0] ?? "Recruiter";
  return user.username;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
  );
}

export default function RecruiterDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: unreadData } = useUnreadNotifications();
  const { data: profile, isLoading: loadingProfile } = useRecruiterProfile();
  const { data: stats, isLoading: loadingStats } = useRecruiterDashboardStats();
  const { data: subResponse, isLoading: loadingSub } = useRecruiterSubscription();
  const { data: usage, isLoading: loadingUsage } = useRecruiterUsage();
  const { data: recs, isLoading: loadingRecs } =
    useDashboardTalentRecommendations(4);

  const subscription = subResponse?.subscription ?? null;
  const plan = subResponse?.plan ?? null;
  const displayName = getDisplayName(user);

  const statCards = [
    {
      icon: CalendarDays,
      value: stats?.active_campaigns ?? 0,
      label: "ACTIVE CAMPAIGNS",
    },
    {
      icon: Bookmark,
      value: stats?.shortlisted_count ?? 0,
      label: "SHORTLISTED",
    },
    {
      icon: ClipboardList,
      value: stats?.pending_reviews ?? 0,
      label: "PENDING REVIEWS",
    },
  ];

  const quickActions = [
    {
      icon: Plus,
      title: "Create Campaign",
      subtitle: "Launch a new casting call",
      accent: "bg-teal-500",
      href: "/recruiter/campaigns/new",
    },
    {
      icon: Search,
      title: "Find Talent",
      subtitle: "Search and discover profiles",
      accent: "bg-slate-700",
      href: "/recruiter/find-talent",
    },
    {
      icon: Briefcase,
      title: "My Campaigns",
      subtitle: "View and manage all campaigns",
      accent: "bg-slate-700",
      href: "/recruiter/campaigns",
    },
  ];

  const talents =
    recs?.data?.map((t) => ({
      match: t.match_score,
      id: t.full_legal_name || t.username,
      username: t.username,
      professions: t.professions ?? [],
      location: t.location?.city ?? "",
      photo: t.profile_photo,
      campaign: t.matched_campaign,
    })) ?? [];

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const messagesUsed = usage?.messages?.used ?? 0;
  const messagesLimit = usage?.messages?.limit ?? 1;
  const campaignsUsed = usage?.campaigns?.used ?? 0;
  const campaignsLimit = usage?.campaigns?.limit ?? 1;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Hero card */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-teal-900/40 bg-gradient-to-br from-[#0a1a24] via-[#081420] to-[#050b14] p-6 text-slate-200">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-teal-500/10 blur-2xl" />
        <div className="absolute right-6 top-16 h-28 w-28 rounded-full border border-teal-500/20" />
        <div className="absolute right-8 top-6 text-teal-300/60">✦</div>
        <div className="absolute right-24 top-32 text-xs text-teal-300/40">
          ✦
        </div>

        <span className="relative mb-4 inline-flex items-center gap-1.5 rounded-full border border-teal-800/60 bg-teal-950/40 px-3 py-1 text-xs font-medium text-teal-300">
          <Sun size={12} /> {getGreeting()}
        </span>

        <h2 className="relative mb-2 text-3xl font-semibold leading-tight text-white">
          Hello,{" "}
          <span className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
            {displayName}
          </span>
        </h2>
        <p className="relative mb-4 max-w-xs text-sm text-slate-400">
          Manage your campaigns and discover top talent.
        </p>

        <div className="relative flex gap-2">
          {plan && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200">
              <Zap size={12} className="text-yellow-400" />{" "}
              {plan.display_name}
            </span>
          )}
          {profile?.verification_status === "enterprise" ||
          profile?.verification_status === "trusted_partner" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200">
              <BadgeCheck size={12} className="text-teal-400" /> Verified
            </span>
          ) : null}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {loadingStats
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800 bg-[#0a1420] p-3.5"
              >
                <SkeletonBlock className="mb-3 h-8 w-8 rounded-lg" />
                <SkeletonBlock className="mb-1 h-6 w-10" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
            ))
          : statCards.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-800 bg-[#0a1420] p-3.5"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-950/60 text-teal-400">
                  <Icon size={16} />
                </div>
                <div className="mb-1 text-2xl font-semibold leading-none text-white">
                  {value}
                </div>
                <div className="text-[10px] leading-tight tracking-wide text-slate-500">
                  {label}
                </div>
              </div>
            ))}
      </div>

      {/* Quick actions */}
      <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-teal-400">
        <Zap size={12} /> QUICK ACTIONS
      </div>
      <div className="mb-6 space-y-3">
        {quickActions.map(({ icon: Icon, title, subtitle, accent, href }) => (
          <Link
            key={title}
            href={href}
            className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-[#0a1420] p-3.5 text-left transition-colors hover:border-teal-800/60"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent} text-white`}
            >
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white">{title}</div>
              <div className="text-xs text-slate-500">{subtitle}</div>
            </div>
            <ArrowRight size={16} className="shrink-0 text-slate-500" />
          </Link>
        ))}
      </div>

      {/* Plan card */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-[#0a1420] p-4">
        {loadingSub || loadingUsage ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock className="h-1 w-full" />
            <SkeletonBlock className="h-1 w-full" />
            <SkeletonBlock className="h-9 w-full" />
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wide text-teal-400">
                {plan?.display_name?.toUpperCase() ?? "PLAN"}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-teal-400">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />{" "}
                {subscription?.status === "active" ? "Active" : subscription?.status ?? "No plan"}
              </span>
            </div>
            {renewalDate && (
              <p className="mb-4 text-xs text-slate-500">
                Renews on {renewalDate}
              </p>
            )}

            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-300">Messages</span>
                <span className="text-slate-500">
                  {messagesUsed} / {messagesLimit}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-teal-500"
                  style={{
                    width: `${Math.min((messagesUsed / messagesLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-300">Campaigns</span>
                <span className="text-slate-500">
                  {campaignsUsed} / {campaignsLimit}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-teal-500"
                  style={{
                    width: `${Math.min((campaignsUsed / campaignsLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/recruiter/billing"
                className="flex-1 rounded-lg border border-teal-700 py-2 text-center text-sm font-medium text-teal-400 transition-colors hover:bg-teal-950/40"
              >
                Change plan
              </Link>
              <Link
                href="/recruiter/billing"
                className="flex-1 rounded-lg border border-slate-700 py-2 text-center text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800/40"
              >
                Cancel plan
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Recommended talent */}
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide text-teal-400">
          RECOMMENDED TALENT
        </span>
        <Link
          href="/recruiter/find-talent"
          className="flex items-center gap-0.5 text-xs font-medium text-teal-400"
        >
          View all <ChevronRight size={14} />
        </Link>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        AI-matched based on your active campaigns
      </p>

      {loadingRecs ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-slate-800 bg-[#0a1420]"
            >
              <SkeletonBlock className="h-28 w-full rounded-none" />
              <div className="space-y-2 p-3">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : talents.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0a1420] p-6 text-center text-sm text-slate-500">
          No recommendations yet. Create a campaign to get matched with talent.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {talents.map((t, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-slate-800 bg-[#0a1420]"
            >
              <div className="relative h-28 w-full">
                {t.photo ? (
                  <img
                    src={t.photo}
                    alt={t.id}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-600">
                    <User size={32} />
                  </div>
                )}
                <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {t.match}%
                </span>
              </div>
              <div className="p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[10px]">
                  <span className="font-medium text-teal-400">
                    {t.match}% match
                  </span>
                  <span className="text-slate-500">{t.username}</span>
                </div>
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-white">
                    {t.id}
                  </span>
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-teal-500">
                    <Check
                      size={9}
                      className="text-[#050b14]"
                      strokeWidth={3}
                    />
                  </span>
                </div>
                {t.professions.length > 0 && (
                  <div className="mb-1.5 text-[11px] text-slate-500">
                    {t.professions[0]}
                    {t.location ? ` • ${t.location}` : ""}
                  </div>
                )}
                {t.professions.length > 1 && (
                  <div className="flex flex-wrap gap-1">
                    {t.professions.slice(0, 2).map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400"
                      >
                        {p}
                      </span>
                    ))}
                    {t.professions.length > 2 && (
                      <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
                        +{t.professions.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
