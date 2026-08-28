"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  LogOut,
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
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
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
       accent: "bg-accent-teal",
      href: "/recruiter/campaigns/new",
    },
    {
      icon: Search,
      title: "Find Talent",
      subtitle: "Search and discover profiles",
       accent: "bg-muted-foreground",
      href: "/recruiter/find-talent",
    },
    {
      icon: Briefcase,
      title: "My Campaigns",
      subtitle: "View and manage all campaigns",
       accent: "bg-muted-foreground",
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
      <div className="hero-gradient relative mb-4 overflow-hidden rounded-2xl border border-border p-6 text-foreground">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent-teal/10 blur-2xl" />
        <div className="absolute right-6 top-16 h-28 w-28 rounded-full border border-accent-teal/20" />
        <div className="absolute right-8 top-6 text-accent-teal/60">✦</div>
        <div className="absolute right-24 top-32 text-xs text-accent-teal/40">
          ✦
        </div>

        <span className="relative mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent-teal/30 bg-accent-teal-bg px-3 py-1 text-xs font-medium text-accent-teal">
          <Sun size={12} /> {getGreeting()}
        </span>

        <h2 className="relative mb-2 text-3xl font-semibold leading-tight text-foreground">
          Hello,{" "}
          <span className="text-accent-teal">
            {displayName}
          </span>
        </h2>
        <p className="relative mb-4 max-w-xs text-sm text-muted-foreground">
          Manage your campaigns and discover top talent.
        </p>

        <div className="relative flex gap-2">
          {plan && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/80">
              <Zap size={12} className="text-accent-amber" />{" "}
              {plan.display_name}
            </span>
          )}
          {profile?.verification_status === "enterprise" ||
          profile?.verification_status === "trusted_partner" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-amber/30 bg-accent-amber-bg px-3 py-1.5 text-xs font-medium text-accent-amber">
              <BadgeCheck size={12} /> Verified
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
                 className="card-surface rounded-xl p-3.5"
              >
                <SkeletonBlock className="mb-3 h-8 w-8 rounded-lg" />
                <SkeletonBlock className="mb-1 h-6 w-10" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
            ))
          : statCards.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                 className="card-surface rounded-xl p-3.5"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-teal-bg text-accent-teal">
                  <Icon size={16} />
                </div>
                <div className="mb-1 text-2xl font-semibold leading-none text-foreground">
                  {value}
                </div>
                <div className="text-[10px] leading-tight tracking-wide text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
      </div>

      {/* Quick actions */}
      <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-accent-teal">
        <Zap size={12} /> QUICK ACTIONS
      </div>
      <div className="mb-6 space-y-3">
        {quickActions.map(({ icon: Icon, title, subtitle, accent, href }) => (
          <Link
            key={title}
            href={href}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left transition-colors hover:border-accent-teal/50"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent} text-accent-foreground`}
            >
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">{title}</div>
              <div className="text-xs text-muted-foreground">{subtitle}</div>
            </div>
            <ArrowRight size={16} className="shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {/* Plan card */}
      <div className="card-surface mb-6 rounded-xl p-4">
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
              <span className="text-[11px] font-semibold tracking-wide text-accent-teal">
                {plan?.display_name?.toUpperCase() ?? "PLAN"}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-accent-green">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />{" "}
                {subscription?.status === "active" ? "Active" : subscription?.status ?? "No plan"}
              </span>
            </div>
            {renewalDate && (
                <p className="mb-4 text-xs text-muted-foreground">
                Renews on {renewalDate}
              </p>
            )}

            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                 <span className="text-foreground/80">Messages</span>
                 <span className="text-muted-foreground">
                  {messagesUsed} / {messagesLimit}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-accent-purple-track">
                <div
                  className="h-full rounded-full bg-accent-teal"
                  style={{
                    width: `${Math.min((messagesUsed / messagesLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                 <span className="text-foreground/80">Campaigns</span>
                 <span className="text-muted-foreground">
                  {campaignsUsed} / {campaignsLimit}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-accent-purple-track">
                <div
                  className="h-full rounded-full bg-accent-teal"
                  style={{
                    width: `${Math.min((campaignsUsed / campaignsLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/recruiter/billing"
                className="flex-1 rounded-lg border border-accent-teal/50 py-2 text-center text-sm font-medium text-accent-teal transition-colors hover:bg-accent-teal-bg"
              >
                Change plan
              </Link>
              <Link
                href="/recruiter/billing"
                className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Cancel plan
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Recommended talent */}
      <div className="mb-1 flex items-center justify-between">
         <span className="text-[11px] font-semibold tracking-wide text-accent-teal">
          RECOMMENDED TALENT
        </span>
        <Link
          href="/recruiter/find-talent"
           className="flex items-center gap-0.5 text-xs font-medium text-accent-teal"
        >
          View all <ChevronRight size={14} />
        </Link>
      </div>
       <p className="mb-3 text-xs text-muted-foreground">
        AI-matched based on your active campaigns
      </p>

      {loadingRecs ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
               className="card-surface overflow-hidden rounded-xl"
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
         <div className="card-surface rounded-xl p-6 text-center text-sm text-muted-foreground">
          No recommendations yet. Create a campaign to get matched with talent.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {talents.map((t, i) => (
            <div
              key={i}
               className="card-surface overflow-hidden rounded-xl"
            >
              <div className="relative h-28 w-full">
                {t.photo ? (
                  <img
                    src={t.photo}
                    alt={t.id}
                    className="h-full w-full object-cover"
                  />
                ) : (
                   <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    <User size={32} />
                  </div>
                )}
                <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {t.match}%
                </span>
              </div>
              <div className="p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[10px]">
                   <span className="font-medium text-accent-teal">
                    {t.match}% match
                  </span>
                   <span className="text-muted-foreground">{t.username}</span>
                </div>
                <div className="mb-1 flex items-center gap-1.5">
                   <span className="truncate text-sm font-medium text-foreground">
                    {t.id}
                  </span>
                   <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-accent-teal">
                    <Check
                      size={9}
                       className="text-accent-foreground"
                      strokeWidth={3}
                    />
                  </span>
                </div>
                {t.professions.length > 0 && (
                   <div className="mb-1.5 text-[11px] text-muted-foreground">
                    {t.professions[0]}
                    {t.location ? ` • ${t.location}` : ""}
                  </div>
                )}
                {t.professions.length > 1 && (
                  <div className="flex flex-wrap gap-1">
                    {t.professions.slice(0, 2).map((p) => (
                      <span
                        key={p}
                         className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {p}
                      </span>
                    ))}
                    {t.professions.length > 2 && (
                       <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
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

      {/* Logout */}
      <button
        onClick={async () => {
          await logout();
          router.push("/auth/login");
        }}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card p-3.5 text-sm font-medium text-muted-foreground transition-colors hover:border-red-500/50 hover:text-red-500"
      >
        <LogOut size={16} />
        Log out
      </button>
    </div>
  );
}
