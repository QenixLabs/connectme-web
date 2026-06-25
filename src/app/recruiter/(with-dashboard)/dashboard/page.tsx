"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { usePopup } from "@/hooks/use-popup";
import { useAuthStore } from "@/providers/auth-store-provider";
import { getGreeting } from "@/lib/greeting";
import {
  useRecruiterDashboardStats,
  useRecruiterProfile,
  useDashboardRecommendations,
} from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { TalentGridCard } from "@/components/talent-grid-card";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  BookmarkCheck,
  MessageSquare,
  Sparkles,
  Plus,
  Search,
  ArrowRight,
  Zap,
  ChevronRight,
  UserPlus,
  Circle,
  CheckCircle2,
  Compass,
  ArrowUpRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  HERO SECTION                                                      */
/* ------------------------------------------------------------------ */

function HeroSection({
  greeting,
  companyName,
  planLabel,
  showVerified,
  verificationLabel,
}: {
  greeting: string;
  companyName: string;
  planLabel: string;
  showVerified: boolean;
  verificationLabel: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-4 pt-5"
    >
      <div className="relative overflow-hidden rounded-[28px] shadow-luxe-lg border border-white/10">
        <div
          className="relative px-5 py-6"
          style={{
            background:
              "radial-gradient(120% 80% at 20% 0%, oklch(0.40 0.04 240) 0%, transparent 55%), radial-gradient(100% 80% at 110% 90%, oklch(0.28 0.03 230) 0%, transparent 50%), linear-gradient(160deg, oklch(0.18 0.02 245) 0%, oklch(0.26 0.03 240) 60%, oklch(0.14 0.02 230) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.16] mix-blend-screen pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 25%, oklch(0.74 0.13 80 / 0.55), transparent 35%), radial-gradient(circle at 85% 65%, oklch(0.68 0.12 75 / 0.3), transparent 40%)",
            }}
          />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-2.5 py-1">
              <Sparkles className="h-3 w-3 text-gold-bright" strokeWidth={2} />
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-gold-bright">
                {greeting}
              </span>
            </div>
            <h1 className="mt-3 font-serif text-[28px] leading-tight font-semibold text-white">
              Hello, <span className="text-gold">{companyName}</span>
            </h1>
            <p className="mt-1 text-[13px] text-white/60">
              Manage your campaigns and discover top talent.
            </p>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 border border-white/10 backdrop-blur-md px-2.5 py-1">
                <Zap className="h-3 w-3 text-gold" strokeWidth={2} />
                <span className="text-[11px] font-medium text-white/80">
                  {planLabel} Plan
                </span>
              </div>
              {showVerified && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/30 border border-white/10 backdrop-blur-md px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-medium text-white/80">
                    {verificationLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  STATS GRID                                                        */
/* ------------------------------------------------------------------ */

const STAT_ITEMS = [
  {
    key: "active_campaigns" as const,
    label: "Active Campaigns",
    icon: Briefcase,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    key: "shortlisted_count" as const,
    label: "Shortlisted",
    icon: BookmarkCheck,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    key: "messages" as const,
    label: "New Messages",
    icon: MessageSquare,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
] as const;

function StatsGrid({
  stats,
  isLoading,
}: {
  stats: Record<string, number> | undefined;
  isLoading: boolean;
}) {
  return (
    <section className="px-4 mt-4">
      <div className="grid grid-cols-3 gap-2.5">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[100px] rounded-2xl" />
            ))
          : STAT_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const value =
                item.key === "messages"
                  ? 0
                  : (stats?.[item.key] ?? 0);
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.15 + idx * 0.07,
                    ease: "easeOut",
                  }}
                  className="rounded-2xl bg-card border border-border/60 shadow-luxe p-3.5 hover:shadow-luxe-lg transition-shadow"
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg grid place-items-center",
                      item.bg,
                    )}
                  >
                    <Icon
                      className={cn("h-4 w-4", item.iconColor)}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="mt-2.5 font-serif text-[24px] font-semibold text-ink leading-none">
                    {value}
                  </div>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                    {item.label}
                  </p>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  QUICK ACTIONS                                                     */
/* ------------------------------------------------------------------ */

const QUICK_ACTIONS = [
  {
    label: "Create Campaign",
    description: "Launch a new casting call",
    icon: Plus,
    href: "/recruiter/campaigns/new",
    gradient:
      "bg-gradient-to-br from-amber-500 to-amber-600 shadow-[0_4px_14px_-4px_oklch(0.68_0.11_75/0.45)]",
  },
  {
    label: "Find Talent",
    description: "Search and discover profiles",
    icon: Search,
    href: "/recruiter/find-talent",
    gradient:
      "bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_4px_14px_-4px_oklch(0.55_0.15_255/0.45)]",
  },
  {
    label: "My Campaigns",
    description: "View and manage all campaigns",
    icon: Briefcase,
    href: "/recruiter/campaigns",
    gradient:
      "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-[0_4px_14px_-4px_oklch(0.45_0.07_265/0.45)]",
  },
];

function QuickActions({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <section className="px-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Quick Actions
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {QUICK_ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              onClick={() => router.push(action.href)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.22 + idx * 0.06,
                ease: "easeOut",
              }}
              className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-luxe hover:shadow-luxe-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] text-left group"
            >
              <div className="relative flex items-center gap-3.5 p-3.5">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                    action.gradient,
                  )}
                >
                  <Icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {action.description}
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 text-ink-muted shrink-0 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PROFILE PROGRESS                                                  */
/* ------------------------------------------------------------------ */

function ProfileProgress({
  profile,
}: {
  profile: Record<string, unknown> | undefined;
}) {
  if (!profile) return null;

  const steps = [
    { label: "Add company name", done: !!profile.company_name },
    { label: "Add company website", done: !!profile.company_website },
    { label: "Select your industry", done: !!profile.industry },
    { label: "Add your position", done: !!profile.position },
    {
      label: "Verify your company",
      done:
        !!profile.verification_status &&
        profile.verification_status !== "pending",
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  if (completed === steps.length) return null;

  return (
    <section className="px-4 mt-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.35, ease: "easeOut" }}
        className="rounded-2xl bg-card border border-border/60 shadow-luxe"
      >
        <div className="flex items-start justify-between px-5 pt-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Profile Strength
            </p>
            <p className="mt-0.5 text-[12px] text-ink-soft">
              {completed} of {steps.length} complete
            </p>
          </div>
          <span className="text-[13px] font-semibold text-gold">{pct}%</span>
        </div>
        <div className="px-4 py-4">
          <div className="h-1.5 rounded-full bg-cream-deep/80 overflow-hidden mb-3">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold to-[oklch(0.82_0.13_80)]"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            />
          </div>
          <ul className="space-y-1.5">
            {steps.map((s) => (
              <li
                key={s.label}
                className="flex items-center gap-3 rounded-xl bg-cream/60 border border-border/50 px-3.5 py-2.5"
              >
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4 text-gold shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-ink-muted/60 shrink-0" />
                )}
                <span
                  className={cn(
                    "flex-1 text-[13px]",
                    s.done
                      ? "text-ink-muted line-through"
                      : "text-ink",
                  )}
                >
                  {s.label}
                </span>
                {!s.done && (
                  <ChevronRight className="h-3.5 w-3.5 text-ink-muted" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  RECOMMENDED TALENT                                                */
/* ------------------------------------------------------------------ */

function RecommendedTalent({
  router,
  stats,
  statsLoading,
}: {
  router: ReturnType<typeof useRouter>;
  stats: Record<string, number> | undefined;
  statsLoading: boolean;
}) {
  const hasActiveCampaigns = stats && stats.active_campaigns > 0;
  const {
    data: recResponse,
    isLoading: recommendationsLoading,
    isError,
  } = useDashboardRecommendations(
    4,
    !!stats && !statsLoading && !!hasActiveCampaigns,
  );

  const recommendations = recResponse?.data;

  const renderContent = () => {
    if (!stats || statsLoading) {
      return (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      );
    }

    if (!hasActiveCampaigns) {
      return (
        <div className="rounded-xl bg-cream/70 border border-dashed border-border px-4 py-8 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-gold-soft grid place-items-center">
            <Compass className="h-6 w-6 text-gold-ink" strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-[14px] font-semibold text-ink">
            No recommendations yet
          </p>
          <p className="mt-1.5 text-[12px] text-ink-muted leading-relaxed max-w-[260px]">
            Create an active campaign and we&apos;ll match you with the best
            talent using AI.
          </p>
          <button
            onClick={() => router.push("/recruiter/campaigns/new")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[oklch(0.78_0.13_80)] to-[oklch(0.68_0.13_78)] text-white text-[12px] font-medium px-4 h-9 shadow-[0_6px_18px_-8px_oklch(0.74_0.13_80/0.7)] hover:-translate-y-0.5 transition-transform"
          >
            Create Campaign <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="rounded-xl bg-error-light border border-error-muted px-4 py-5 text-center">
          <p className="text-[13px] text-error-text">
            Unable to load recommendations. Try refreshing.
          </p>
        </div>
      );
    }

    if (recommendationsLoading) {
      return (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      );
    }

    if (recommendations && recommendations.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-3">
          {recommendations.map((talent) => (
            <TalentGridCard
              key={talent._id}
              profile={{
                ...talent,
                is_verified: true,
              }}
              matchScore={talent.match_score}
              campaignName={talent.matched_campaign}
              onViewProfile={() =>
                router.push("/talent/" + talent.username)
              }
            />
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-xl bg-cream/70 border border-dashed border-border px-4 py-6 flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-2xl bg-gold-soft grid place-items-center">
          <UserPlus className="h-5 w-5 text-gold-ink" strokeWidth={1.5} />
        </div>
        <p className="mt-3 text-[13px] font-medium text-ink">
          No matching talent found
        </p>
        <p className="mt-1 text-[12px] text-ink-muted leading-relaxed max-w-[240px]">
          Try broadening your campaign requirements for better matches.
        </p>
      </div>
    );
  };

  return (
    <section className="px-4 mt-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
        className="rounded-2xl bg-card border border-border/60 shadow-luxe"
      >
        <div className="flex items-start justify-between px-5 pt-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Recommended Talent
            </p>
            <p className="mt-0.5 text-[12px] text-ink-soft">
              AI-matched based on your active campaigns
            </p>
          </div>
          {hasActiveCampaigns &&
            recommendations &&
            recommendations.length > 0 && (
              <button
                onClick={() => router.push("/recruiter/find-talent")}
                className="text-[11px] font-medium text-gold flex items-center gap-0.5 hover:text-gold-hover transition-colors"
              >
                View all <ChevronRight className="h-3 w-3" />
              </button>
            )}
        </div>
        <div className="px-4 py-4">{renderContent()}</div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                         */
/* ------------------------------------------------------------------ */

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const popup = usePopup();
  const { user } = useAuthStore();
  const greeting = getGreeting();

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      popup.show({ title: "You're now on a new plan!", variant: "success" });
    }
  }, [searchParams]);

  const { data: profile } = useRecruiterProfile();
  const { data: stats, isLoading: statsLoading } = useRecruiterDashboardStats();

  const companyName =
    profile?.company_name || user?.email?.split("@")[0] || "Recruiter";

  const planLabel =
    !profile?.active_plan || profile.active_plan === "recruiter_free"
      ? "Free"
      : profile.active_plan === "recruiter_pro"
        ? "Pro"
        : profile.active_plan === "recruiter_business"
          ? "Business"
          : String(profile.active_plan);

  const showVerified =
    !!profile?.verification_status &&
    profile.verification_status !== "pending";

  const verificationLabel =
    profile?.verification_status === "trusted_partner"
      ? "Trusted Partner"
      : profile?.verification_status === "enterprise"
        ? "Enterprise Verified"
        : "Verified";

  return (
    <div className="min-h-screen bg-background pb-2">
      <HeroSection
        greeting={greeting}
        companyName={companyName}
        planLabel={planLabel}
        showVerified={showVerified}
        verificationLabel={verificationLabel}
      />

      <StatsGrid stats={stats as Record<string, number> | undefined} isLoading={statsLoading} />

      <QuickActions router={router} />

      <div className="px-4 mt-4">
        <SubscriptionStatus variant="luxe" />
      </div>

      <ProfileProgress profile={profile as Record<string, unknown> | undefined} />

      <RecommendedTalent
        router={router}
        stats={stats as Record<string, number> | undefined}
        statsLoading={statsLoading}
      />
    </div>
  );
}
