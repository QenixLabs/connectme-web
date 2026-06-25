"use client";

import Link from "next/link";
import {
  Eye,
  CalendarDays,
  Inbox,
  Pencil,
  ExternalLink,
  FileText,
  Bookmark,
  ShieldCheck,
  BadgeCheck,
  ChevronRight,
  Circle,
  Zap,
  AlertCircle,
  RefreshCcw,
  Compass,
  MapPin,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { getGreeting } from "@/lib/greeting";
import {
  talentApi,
  campaignApi,
  subscriptionsApi,
  useUnreadMessageCount,
  type Campaign,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/api/query-keys";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------------------------------------------ */
/*  INDUSTRY GRADIENT MAP                                             */
/* ------------------------------------------------------------------ */

const INDUSTRY_GRADIENT: Record<string, string> = {
  film: "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  cinema: "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  fashion: "from-[var(--color-opportunity-fashion-start)] to-[var(--color-opportunity-fashion-end)]",
  modeling: "from-[var(--color-opportunity-fashion-start)] to-[var(--color-opportunity-fashion-end)]",
  television: "from-[var(--color-opportunity-tv-start)] to-[var(--color-opportunity-tv-end)]",
  tv: "from-[var(--color-opportunity-tv-start)] to-[var(--color-opportunity-tv-end)]",
  theater: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  theatre: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
};

function resolveGradient(industry?: string) {
  if (!industry) return "from-[var(--color-opportunity-default-start)] to-[var(--color-opportunity-default-end)]";
  const key = industry.toLowerCase();
  return INDUSTRY_GRADIENT[key] ?? "from-[var(--color-opportunity-default-start)] to-[var(--color-opportunity-default-end)]";
}

/* ------------------------------------------------------------------ */
/*  HOOKS                                                             */
/* ------------------------------------------------------------------ */

function useDashboardProfile() {
  return useQuery({
    queryKey: queryKeys.talent.myProfile(),
    queryFn: () => talentApi.getMyProfile(),
    staleTime: 60_000,
  });
}

function useDashboardCompleteness() {
  return useQuery({
    queryKey: queryKeys.talent.completeness(),
    queryFn: () => talentApi.getCompleteness(),
    staleTime: 120_000,
  });
}

function useRecommended(limit: number) {
  return useQuery<Campaign[]>({
    queryKey: ["campaigns", "recommendations", limit],
    queryFn: () => campaignApi.getRecommendations(limit),
    staleTime: 120_000,
  });
}

function useDashboardSub() {
  return useQuery({
    queryKey: queryKeys.subscriptions.me(),
    queryFn: () => subscriptionsApi.getMySubscription(),
    staleTime: 120_000,
  });
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                         */
/* ------------------------------------------------------------------ */

export default function TalentDashboardPage() {
  const { user } = useAuthStore();
  const greeting = getGreeting();
  const verificationTier = user?.verification_tier ?? 1;
  const isVerified = verificationTier >= 2;

  const profileQuery = useDashboardProfile();
  const completenessQuery = useDashboardCompleteness();
  const recommendationsQuery = useRecommended(5);
  const { data: unreadData } = useUnreadMessageCount();
  const messageCount = unreadData?.count ?? 0;

  const profile = profileQuery.data ?? null;

  const displayName =
    profile?.full_legal_name ||
    profile?.username ||
    user?.email?.split("@")[0] ||
    "Talent";

  const locationStr = [profile?.location?.city, profile?.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  return (
    <div className="min-h-screen bg-page pb-24 space-y-4 px-4 pt-5 max-w-2xl mx-auto">
      <WelcomeBar
        displayName={displayName}
        greeting={greeting}
        isVerified={isVerified}
        profilePhoto={profile?.profile_photo}
        location={locationStr}
        isLoading={profileQuery.isLoading}
      />

      <ProfileStrengthCard
        completeness={completenessQuery.data}
        isLoading={completenessQuery.isLoading}
        isError={completenessQuery.isError}
        onRetry={() => completenessQuery.refetch()}
      />

      <StatsRow
        views7d={profile?.analytics?.profile_views_7d ?? 0}
        views30d={profile?.analytics?.profile_views_30d ?? 0}
        messages={messageCount}
        isLoading={profileQuery.isLoading}
      />

      <SubscriptionPill />

      <OpportunityStrip
        campaigns={recommendationsQuery.data ?? []}
        isLoading={recommendationsQuery.isLoading}
      />

      <QuickActions username={profile?.username ?? null} />

      {profileQuery.isError && (
        <div className="rounded-xl bg-error-light border border-error-muted p-4 text-sm text-error-text">
          Failed to load profile data
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WELCOME BAR                                                       */
/* ------------------------------------------------------------------ */

function WelcomeBar({
  displayName,
  greeting,
  isVerified,
  profilePhoto,
  location,
  isLoading,
}: {
  displayName: string;
  greeting: string;
  isVerified: boolean;
  profilePhoto?: string | null;
  location: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-28 rounded-full" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-cream border-2 border-gold/20 shrink-0 overflow-hidden grid place-items-center">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gold-ink font-serif font-semibold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">
            {greeting}
          </p>
          <h1 className="text-lg font-serif font-semibold text-ink truncate mt-0.5">
            {displayName}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft">
                <MapPin className="h-3 w-3 text-ink-muted" />
                {location}
              </span>
            )}
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success-text bg-success-light border border-success-soft rounded-full px-2.5 py-0.5">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
            ) : (
              <Link
                href="/talent/verify-documents"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-ink bg-gold-soft border border-gold/20 rounded-full px-2.5 py-0.5 hover:bg-gold-soft/80 transition-colors"
              >
                <ShieldCheck className="h-3 w-3" />
                Verify identity
              </Link>
            )}
          </div>
        </div>

        <Link
          href="/talent/profile?edit=1"
          className="shrink-0 h-9 w-9 rounded-xl bg-cream border border-border flex items-center justify-center text-ink-soft hover:bg-cream-hover transition-colors"
          aria-label="Edit profile"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  PROFILE STRENGTH RING                                             */
/* ------------------------------------------------------------------ */

const TOTAL_CHECK_FIELDS = 36;

function ProfileStrengthCard({
  completeness,
  isLoading,
  isError,
  onRetry,
}: {
  completeness?: { isComplete: boolean; missingFields: string[] } | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-48 rounded-full" />
            <Skeleton className="h-3 w-36 rounded-full" />
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </Card>
    );
  }

  if (isError || !completeness) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-error shrink-0" />
          <span className="text-[13px] text-ink-soft flex-1">Could not load profile strength</span>
          <button
            onClick={onRetry}
            className="rounded-xl bg-cream hover:bg-cream-hover p-1.5 transition-colors"
            aria-label="Retry"
          >
            <RefreshCcw className="h-3.5 w-3.5 text-ink-muted" />
          </button>
        </div>
      </Card>
    );
  }

  const complete = TOTAL_CHECK_FIELDS - completeness.missingFields.length;
  const pct = Math.round((complete / TOTAL_CHECK_FIELDS) * 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const priorityMissing = completeness.missingFields.slice(0, 3);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width={68} height={68} className="-rotate-90">
            <circle
              cx={34}
              cy={34}
              r={radius}
              fill="none"
              stroke="var(--color-cream-deep)"
              strokeWidth={5}
            />
            <motion.circle
              cx={34}
              cy={34}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={5}
              strokeLinecap="round"
              className="text-gold"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink font-mono">
            {pct}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-ink">Profile Strength</p>
          <p className="text-[12px] text-ink-soft mt-0.5">
            {complete} of {TOTAL_CHECK_FIELDS} fields complete
          </p>
          {priorityMissing.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {priorityMissing.map((field) => (
                <span
                  key={field}
                  className="inline-flex items-center gap-1 text-[10.5px] text-ink-soft bg-cream border border-border/50 rounded-full px-2 py-1"
                >
                  <Circle className="h-2.5 w-2.5 text-ink-muted/60" />
                  {fieldLabel(field)}
                </span>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/talent/profile?edit=1"
          className="shrink-0 rounded-xl bg-cream hover:bg-cream-hover border border-border/60 text-ink text-[12px] font-medium px-3.5 h-8 inline-flex items-center gap-1 transition-colors"
        >
          Complete <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}

function fieldLabel(path: string): string {
  const labels: Record<string, string> = {
    username: "Username",
    full_legal_name: "Legal name",
    date_of_birth: "Date of birth",
    gender: "Gender",
    profile_photo: "Profile photo",
    location: "Location",
    "location.country": "Country",
    "location.state": "State",
    "location.city": "City",
    professions: "Professions",
    industries: "Industries",
    availability: "Availability",
    headline: "Headline",
    about: "About",
    physical_attributes: "Physical stats",
    "physical_attributes.height_cm": "Height",
    "physical_attributes.weight_kg": "Weight",
    "physical_attributes.body_type": "Body type",
    "physical_attributes.complexion": "Complexion",
    "physical_attributes.hair_color": "Hair color",
    "physical_attributes.hair_length": "Hair length",
    "physical_attributes.eye_color": "Eye color",
    "physical_attributes.distinctive_features": "Features",
    languages: "Languages",
    accents: "Accents",
    skills: "Skills",
    documents: "Documents",
    "documents.resume_url": "Resume",
    "documents.portfolio_pdf_url": "Portfolio PDF",
    "documents.measurements_sheet_url": "Measurements",
    social_links: "Social links",
    "social_links.instagram": "Instagram",
    "social_links.youtube": "YouTube",
    "social_links.linkedin": "LinkedIn",
    privacy_mode: "Privacy mode",
  };
  return labels[path] ?? path;
}

/* ------------------------------------------------------------------ */
/*  STATS ROW                                                         */
/* ------------------------------------------------------------------ */

function StatsRow({
  views7d,
  views30d,
  messages,
  isLoading,
}: {
  views7d: number;
  views30d: number;
  messages: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="p-3">
            <Skeleton className="h-3 w-8 rounded-full mb-2" />
            <Skeleton className="h-6 w-12 mb-1" />
            <Skeleton className="h-3 w-12 rounded-full" />
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    { label: "7d Views", value: views7d, icon: Eye },
    { label: "30d Views", value: views30d, icon: CalendarDays },
    { label: "Messages", value: messages, icon: Inbox },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {items.map((item) => (
        <Card key={item.label} className="p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <item.icon className="h-3.5 w-3.5 text-ink-muted" />
            <span className="text-[10px] uppercase tracking-[0.1em] text-ink-muted font-medium">
              {item.label}
            </span>
          </div>
          <p className="text-xl font-serif font-semibold text-ink">{item.value.toLocaleString()}</p>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SUBSCRIPTION PILL                                                 */
/* ------------------------------------------------------------------ */

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-400",
  trialing: "bg-emerald-400",
  pending: "bg-amber-400",
  past_due: "bg-red-400",
  cancelled: "bg-gray-400",
  expired: "bg-gray-400",
  paused: "bg-orange-400",
};

function SubscriptionPill() {
  const { data, isLoading, error, refetch } = useDashboardSub();

  if (isLoading) {
    return (
      <Card className="p-3">
        <Skeleton className="h-4 w-48 rounded-full" />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-3">
        <div className="flex items-center gap-2 text-[12px] text-ink-soft">
          <AlertCircle className="h-3.5 w-3.5 text-error shrink-0" />
          Plan info unavailable
          <button onClick={() => refetch()} className="ml-auto text-gold text-[11px] font-medium">
            Retry
          </button>
        </div>
      </Card>
    );
  }

  const sub = data.subscription;
  const plan = data.plan;
  const isFree = !sub?.plan_key || sub.plan_key === "recruiter_free";
  const status = sub?.status ?? "active";
  const dot = STATUS_DOT[status] ?? "bg-gray-400";

  const endDate = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <Link href="/billing" className="block">
      <Card className="p-3 hover:border-gold/20 transition-colors cursor-pointer">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-gold shrink-0" />
          <span
            className={cn(
              "text-[12px] font-medium rounded-full px-2.5 py-0.5",
              isFree
                ? "bg-cream-deep/80 border border-border/40 text-ink-soft"
                : "bg-gold-soft border border-gold/15 text-gold-ink",
            )}
          >
            {plan?.display_name || "Free"}
          </span>
          {!isFree && (
            <>
              <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
              <span className="text-[11px] text-ink-soft">{status === "active" ? "Active" : status}</span>
            </>
          )}
          {endDate && (
            <span className="text-[11px] text-ink-muted ml-auto">
              Renews {endDate}
            </span>
          )}
          {isFree && (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-gold">
              Upgrade <ChevronRight className="h-3 w-3" />
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  OPPORTUNITY STRIP                                                 */
/* ------------------------------------------------------------------ */

function OpportunityStrip({
  campaigns,
  isLoading,
}: {
  campaigns: Campaign[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-3 w-14 rounded-full" />
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-64 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-ink">Opportunities for you</p>
        <Link
          href="/talent/opportunities"
          className="text-[11px] font-medium text-gold flex items-center gap-0.5"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card className="p-6 flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-xl bg-gold-soft grid place-items-center mb-3">
            <Compass className="h-5 w-5 text-gold-ink" />
          </div>
          <p className="text-[13px] font-medium text-ink">No recommendations yet</p>
          <p className="text-[12px] text-ink-muted mt-1 max-w-[240px]">
            Complete your profile to get matched with verified opportunities.
          </p>
          <Link
            href="/talent/profile?edit=1"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold to-gold-light text-white text-[12px] font-medium px-4 h-9 shadow-[0_6px_18px_-8px_oklch(0.74_0.13_80/0.7)]"
          >
            Complete profile
          </Link>
        </Card>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1">
          {campaigns.map((campaign, i) => (
            <OpportunityCard key={campaign._id} campaign={campaign} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function OpportunityCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const loc = [campaign.location?.city, campaign.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  const gradient = resolveGradient(campaign.industry);

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
    >
      <Link href={`/talent/opportunities/${campaign._id}`} className="block">
        <Card
          className={cn(
            "w-64 shrink-0 overflow-hidden rounded-xl border-0 bg-gradient-to-br text-white",
            gradient,
          )}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold leading-snug line-clamp-2">{campaign.name}</h3>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {campaign.role_type && (
                <span className="text-[10.5px] bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 font-medium">
                  {campaign.role_type}
                </span>
              )}
              {campaign.industry && (
                <span className="text-[10.5px] bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 font-medium">
                  {campaign.industry}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                {loc && (
                  <span className="text-[10.5px] text-white/70 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {loc}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10.5px] text-white/70">
                <Users className="h-3 w-3" />
                {campaign.applications_count ?? 0}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  QUICK ACTIONS                                                     */
/* ------------------------------------------------------------------ */

function QuickActions({ username }: { username: string | null }) {
  const actions = [
    { href: "/talent/profile?edit=1", label: "Edit Profile", icon: Pencil, primary: true },
    { href: username ? `/talent/${username}` : "/talent/profile?edit=1", label: "Public Profile", icon: ExternalLink },
    { href: "/talent/applications", label: "Applications", icon: FileText },
    { href: "/talent/opportunities?tab=saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.label}
            href={a.href}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-[12px] font-medium transition-colors",
              a.primary
                ? "bg-gradient-to-b from-gold to-gold-light text-white shadow-[0_6px_18px_-8px_oklch(0.74_0.13_80/0.7)]"
                : "bg-card border border-border text-ink-soft hover:bg-cream",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {a.label}
          </Link>
        );
      })}
    </div>
  );
}
