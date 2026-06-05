"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Eye,
  CalendarDays,
  Star,
  Inbox,
  Pencil,
  ExternalLink,
  FileText,
  Bookmark,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Compass,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { getGreeting } from "@/lib/greeting";
import { talentApi, type Campaign } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { useRecommendedCampaigns } from "@/lib/api/hooks/useCampaigns";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  OPPORTUNITIES                                                     */
/* ------------------------------------------------------------------ */

function DashboardRecommendations() {
  const { data, isLoading } = useRecommendedCampaigns(5);
  const campaigns: Campaign[] = data || [];

  if (isLoading) {
    return (
      <section className="px-4 mt-4">
        <SectionCard label="Opportunities for you" sub="Matched based on your profile">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </SectionCard>
      </section>
    );
  }

  if (campaigns.length === 0) {
    return (
      <section className="px-4 mt-4">
        <SectionCard
          label="Opportunities for you"
          sub="Matched based on your profile"
          action={
            <Link
              href="/talent/opportunities"
              className="text-[11px] font-medium text-gold flex items-center gap-0.5"
            >
              All <ChevronRight className="h-3 w-3" />
            </Link>
          }
        >
          <div className="rounded-xl bg-cream/70 border border-dashed border-border px-4 py-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-2xl bg-gold-soft grid place-items-center">
              <Compass className="h-5 w-5 text-gold-ink" />
            </div>
            <p className="mt-3 text-[13.5px] font-medium text-ink">No recommendations yet</p>
            <p className="mt-1 text-[12px] text-ink-muted leading-relaxed max-w-[240px]">
              Complete your profile to get matched with verified opportunities.
            </p>
            <Link
              href="/talent/profile?edit=1"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[oklch(0.78_0.13_80)] to-[oklch(0.68_0.13_78)] text-white text-[12px] font-medium px-4 h-9 shadow-[0_6px_18px_-8px_oklch(0.74_0.13_80/0.7)]"
            >
              Complete profile <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </SectionCard>
      </section>
    );
  }

  return (
    <section className="px-4 mt-4">
      <SectionCard
        label="Opportunities for you"
        sub="Matched based on your profile"
        action={
          <Link
            href="/talent/opportunities"
            className="text-[11px] font-medium text-gold flex items-center gap-0.5"
          >
            All <ChevronRight className="h-3 w-3" />
          </Link>
        }
      >
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <RecommendationCard key={campaign._id} campaign={campaign} />
          ))}
        </div>
      </SectionCard>
    </section>
  );
}

function RecommendationCard({ campaign }: { campaign: Campaign }) {
  const loc = [campaign.location?.city, campaign.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow rounded-xl">
      {campaign.cover_image_url && (
        <div className="w-full h-32 overflow-hidden">
          <img src={campaign.cover_image_url} alt={campaign.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-ink truncate">{campaign.name}</h3>
            <p className="text-xs text-ink-muted mt-1">
              {campaign.industry || "Campaign"}
              {loc ? ` · ${loc}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {campaign.role_type && (
              <span className="text-xs text-ink-muted bg-cream px-2 py-0.5 rounded">{campaign.role_type}</span>
            )}
            {campaign.budget_range && (
              <span className="text-xs text-ink-muted bg-cream px-2 py-0.5 rounded">
                {campaign.budget_range.currency || "USD"} {campaign.budget_range.min?.toLocaleString()}
                {campaign.budget_range.max ? ` - ${campaign.budget_range.max.toLocaleString()}` : "+"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                         */
/* ------------------------------------------------------------------ */

const EMPTY_STATS = {
  profileViews7d: 0,
  profileViews30d: 0,
  shortlists: 0,
  messages: 0,
};

export default function TalentDashboardPage() {
  const { user } = useAuthStore();
  const firstName = user!.email.split("@")[0];
  const greetingText = getGreeting();
  const verificationTier = user!.verification_tier || 1;
  const isVerified = verificationTier >= 2;

  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    talentApi
      .getMyProfile()
      .then((p) => {
        setProfile(p);
        setStats({
          profileViews7d: p?.analytics?.profile_views_7d ?? 0,
          profileViews30d: p?.analytics?.profile_views_30d ?? 0,
          shortlists: p?.analytics?.shortlist_count ?? 0,
          messages: 0,
        });
      })
      .catch((err) => {
        setProfileError(getApiErrorMessage(err, "Failed to load profile"));
      });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-2">
      <GreetingSection firstName={firstName} greetingText={greetingText} isVerified={isVerified} />
      <StatsGrid stats={stats} />
      <QuickActions profile={profile} />
      <DashboardRecommendations />
      <NextSteps profile={profile} isVerified={isVerified} />
      <TrustNote />

      {profileError && (
        <section className="px-4 mt-4">
          <div className="rounded-xl bg-error-light border border-error-muted p-4 text-sm text-error-text">
            {profileError}
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GREETING                                                          */
/* ------------------------------------------------------------------ */

function GreetingSection({
  firstName,
  greetingText,
  isVerified,
}: {
  firstName: string;
  greetingText: string;
  isVerified: boolean;
}) {
  return (
    <section className="px-4 pt-5">
      <div className="relative overflow-hidden rounded-[28px] shadow-luxe-lg border border-border/60">
        <div
          className="relative px-5 py-6"
          style={{
            background:
              "radial-gradient(120% 80% at 20% 0%, oklch(0.42 0.06 60) 0%, transparent 55%), radial-gradient(120% 90% at 100% 100%, oklch(0.30 0.04 50) 0%, transparent 50%), linear-gradient(160deg, oklch(0.22 0.03 55) 0%, oklch(0.30 0.04 55) 60%, oklch(0.18 0.03 50) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.18] mix-blend-screen pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, oklch(0.74 0.13 80 / 0.5), transparent 35%), radial-gradient(circle at 80% 70%, oklch(0.74 0.13 80 / 0.35), transparent 40%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-1.5 rounded-full bg-gold/15 backdrop-blur-md border border-gold/30 px-2.5 py-1 w-fit">
              <Sparkles className="h-3 w-3 text-gold" />
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-gold">{greetingText}</span>
            </div>
            <h1 className="mt-3 font-serif text-[26px] leading-tight font-semibold text-white">
              Hello, <span className="text-gold">{firstName}</span>
            </h1>
            <p className="mt-1 text-[13px] text-white/70">Here&apos;s what&apos;s happening with your career today.</p>

            {isVerified ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/30 border border-white/10 backdrop-blur-md pl-2 pr-3 py-1.5">
                <div className="h-5 w-5 rounded-full bg-gold grid place-items-center">
                  <BadgeCheck className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[11.5px] font-medium text-white tracking-wide">Identity Verified</span>
              </div>
            ) : (
              <Link
                href="/talent/verify-documents"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/30 border border-white/10 backdrop-blur-md pl-2 pr-3 py-1.5"
              >
                <div className="h-5 w-5 rounded-full bg-gold/50 grid place-items-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[11.5px] font-medium text-white/80 tracking-wide">Verify Identity</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  STATS                                                             */
/* ------------------------------------------------------------------ */

function StatsGrid({
  stats,
}: {
  stats: { profileViews7d: number; profileViews30d: number; shortlists: number; messages: number };
}) {
  const items = [
    { label: "7-day Views", value: String(stats.profileViews7d), icon: Eye, accent: true },
    { label: "30-day Views", value: String(stats.profileViews30d), icon: CalendarDays },
    { label: "Shortlists", value: String(stats.shortlists), icon: Star },
    { label: "Messages", value: String(stats.messages), icon: Inbox },
  ];

  return (
    <section className="px-4 mt-4">
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((s) => (
          <StatTile key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-luxe p-4">
      <div className="flex items-center justify-between">
        <div className={`h-8 w-8 rounded-lg grid place-items-center ${accent ? "bg-gold-soft" : "bg-cream"}`}>
          <Icon className={`h-4 w-4 ${accent ? "text-gold-ink" : "text-gold"}`} />
        </div>
      </div>
      <div className="mt-3 font-serif text-[26px] font-semibold text-ink leading-none">{value}</div>
      <div className="mt-1.5 text-[10.5px] uppercase tracking-[0.12em] text-ink-muted">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QUICK ACTIONS                                                     */
/* ------------------------------------------------------------------ */

function QuickActions({ profile }: { profile: TalentProfile | null }) {
  const actions: { to: string; label: string; icon: ComponentType<{ className?: string }>; primary?: boolean }[] = [
    { to: "/talent/profile?edit=1", label: "Edit Profile", icon: Pencil, primary: true },
    { to: profile?.username ? `/talent/${profile.username}` : "#", label: "Public Profile", icon: ExternalLink },
    { to: "/talent/applications", label: "Applications", icon: FileText },
    { to: "/talent/opportunities?tab=saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <section className="px-4 mt-4">
      <div className="rounded-2xl bg-card border border-border/60 shadow-luxe p-2.5 grid grid-cols-4 gap-1.5">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={a.to}
              className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl active:scale-[0.97] transition"
            >
              <div
                className={`h-10 w-10 rounded-xl grid place-items-center ${
                  a.primary
                    ? "bg-gradient-to-b from-[oklch(0.78_0.13_80)] to-[oklch(0.68_0.13_78)] shadow-[0_6px_18px_-8px_oklch(0.74_0.13_80/0.7)]"
                    : "bg-cream border border-border"
                }`}
              >
                <Icon className={`h-4 w-4 ${a.primary ? "text-white" : "text-gold"}`} />
              </div>
              <span className="text-[10.5px] font-medium text-ink-soft text-center leading-tight">{a.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  NEXT STEPS                                                        */
/* ------------------------------------------------------------------ */

function NextSteps({ profile, isVerified }: { profile: TalentProfile | null; isVerified: boolean }) {
  const steps = [
    { label: "Add a profile photo", done: !!profile?.profile_photo },
    { label: "Verify your identity", done: isVerified },
    { label: "Add 3 portfolio items", done: false, meta: "0 of 3" },
    { label: "Connect Instagram", done: !!profile?.social_links?.instagram?.url },
    { label: "List your top skills", done: (profile?.skills?.length ?? 0) > 0 },
  ];

  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  return (
    <section className="px-4 mt-4">
      <SectionCard label="Recommended next steps" sub={`${completed} of ${steps.length} complete`}>
        <div className="mb-3">
          <div className="h-1.5 rounded-full bg-cream-deep/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-[oklch(0.82_0.13_80)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10.5px] uppercase tracking-[0.12em] text-ink-muted">Profile strength</span>
            <span className="text-[11px] font-semibold text-gold">{pct}%</span>
          </div>
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
              <span className={`flex-1 text-[13px] ${s.done ? "text-ink-muted line-through" : "text-ink"}`}>
                {s.label}
              </span>
              {s.meta && <span className="text-[11px] text-gold font-medium">{s.meta}</span>}
              {!s.done && <ChevronRight className="h-3.5 w-3.5 text-ink-muted" />}
            </li>
          ))}
        </ul>
      </SectionCard>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  TRUST NOTE                                                        */
/* ------------------------------------------------------------------ */

function TrustNote() {
  return (
    <section className="px-4 mt-4">
      <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gold-soft/60 p-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-card grid place-items-center border border-gold/30 shrink-0">
            <ShieldCheck className="h-4 w-4 text-gold-ink" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink leading-tight">Only verified recruiters can contact you</p>
            <p className="mt-1 text-[12px] text-ink-soft leading-relaxed">
              We verify every recruiter before they can message or shortlist talent. Report anything suspicious.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PRIMITIVES                                                        */
/* ------------------------------------------------------------------ */

function SectionCard({
  children,
  label,
  sub,
  action,
}: {
  children: React.ReactNode;
  label: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-luxe">
      <div className="flex items-start justify-between px-5 pt-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">{label}</p>
          {sub && <p className="mt-0.5 text-[12px] text-ink-soft">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
