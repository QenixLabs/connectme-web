"use client";

import { useState } from "react";
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
  Sun,
  Moon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { getGreeting } from "@/lib/greeting";
import {
  talentApi,
  subscriptionsApi,
  useUnreadMessageCount,
  useTalentCampaignRecommendations,
  type Campaign,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { resolveHeroBackground } from "@/lib/hero-color";
import { queryKeys } from "@/lib/api/query-keys";
import {
  Card,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const recommendationsQuery = useTalentCampaignRecommendations(5);
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
        username={profile?.username ?? null}
        heroBackground={profile?.hero_background ?? null}
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
        campaigns={(recommendationsQuery.data?.data ?? []).map((r) => r.campaign as unknown as Campaign)}
        isLoading={recommendationsQuery.isLoading}
      />

      <QuickActions username={profile?.username ?? null} />

      {profileQuery.isError && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load profile data</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WELCOME BAR                                                       */
/* ------------------------------------------------------------------ */

function getGreetingIcon() {
  const hour = new Date().getHours();
  if (hour < 12) return Sun;
  if (hour < 17) return Sun;
  return Moon;
}

function WelcomeBar({
  displayName,
  greeting,
  isVerified,
  profilePhoto,
  location,
  isLoading,
  username,
  heroBackground,
}: {
  displayName: string;
  greeting: string;
  isVerified: boolean;
  profilePhoto?: string | null;
  location: string;
  isLoading: boolean;
  username: string | null;
  heroBackground?: string | null;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const GreetingIcon = getGreetingIcon();

  const hero = resolveHeroBackground(
    imgFailed ? undefined : heroBackground,
    username ?? "default",
  );
  const fallbackBg = resolveHeroBackground(
    undefined,
    username ?? "default",
  ).background;
  const showBgImage = hero.isImage && !imgFailed;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Card className="overflow-hidden">
          <div className="h-[180px] bg-muted/50">
            <div className="flex items-end gap-4 px-5 pb-4 pt-20">
              <Skeleton className="h-14 w-14 rounded-full shrink-0 ring-2 ring-white/20" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-28 rounded-full" />
              </div>
              <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <Link href={`/talent/${username ?? ""}`} className="block group">
        <Card className="overflow-hidden relative rounded-[20px] border-0 shadow-lg">
          {/* Hero background banner */}
          <div
            className="relative h-[200px] transition-colors duration-700"
            style={{
              background: showBgImage ? undefined : (imgFailed ? fallbackBg : hero.background),
              backgroundImage: showBgImage ? hero.background : undefined,
            }}
          >
            {/* Depth overlays */}
            <div
              className="absolute inset-0 z-0"
              style={{
                background: `
                  radial-gradient(ellipse 120% 60% at 50% 30%, rgba(255,255,255,0.04) 0%, transparent 65%),
                  radial-gradient(ellipse 80% 40% at 50% 85%, rgba(0,0,0,0.15) 0%, transparent 60%)
                `,
              }}
            />
            {/* Grain texture */}
            <div
              className="absolute inset-0 z-[1] opacity-[0.03] mix-blend-overlay"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }}
            />

            {/* Hidden img for image error detection */}
            {hero.isImage && !imgFailed && (
              <img
                src={heroBackground!}
                alt=""
                className="hidden"
                onError={() => setImgFailed(true)}
              />
            )}

            {/* Gold accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-0.5 rounded-b-full bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />

            {/* Edit button — top right */}
            <Link
              href="/talent/profile?edit=1"
              className="absolute top-3 right-3 z-20 h-8 w-8 rounded-xl bg-black/25 backdrop-blur-md border border-white/10 inline-flex items-center justify-center text-white/70 hover:text-white hover:bg-black/35 transition-all"
              aria-label="Edit profile"
              onClick={(e) => e.stopPropagation()}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>

            {/* Content overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end gap-4 px-5 pb-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="absolute -inset-0.5 rounded-full bg-white/10 blur-md" />
                <div className="relative h-14 w-14 rounded-full p-[2px] bg-gradient-to-b from-white/25 to-white/5">
                  <div className="h-full w-full rounded-full bg-white/10 backdrop-blur-sm overflow-hidden ring-1 ring-white/15 grid place-items-center">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-serif font-semibold text-xl text-white/40">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Name + info */}
              <div className="flex-1 min-w-0 pb-0.5">
                <div className="flex items-center gap-1.5">
                  <GreetingIcon className="h-3 w-3 text-white/60" />
                  <p className="text-2xs font-medium uppercase tracking-[0.15em] text-white/50">
                    {greeting}
                  </p>
                </div>
                <h2 className="text-lg font-serif font-semibold text-white leading-tight truncate mt-0.5">
                  {displayName}
                </h2>
                <p className="text-[10.5px] text-white/45 mt-0.5">
                  {today}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {location && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] text-white/55">
                      <MapPin className="h-3 w-3" />
                      {location}
                    </span>
                  )}
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300 bg-emerald-500/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 border border-emerald-400/20">
                      <BadgeCheck className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-medium text-white/70 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-0.5 border border-white/10 hover:bg-white/15 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = "/talent/verify-documents";
                      }}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      Verify identity
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
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
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-48 rounded-full" />
              <Skeleton className="h-3 w-36 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !completeness) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-error-light inline-flex items-center justify-center shrink-0">
              <AlertCircle className="h-4 w-4 text-error" />
            </div>
            <span className="text-sm text-muted-foreground flex-1">Could not load profile strength</span>
            <button
              onClick={onRetry}
              className="rounded-xl bg-cream hover:bg-cream-hover p-1.5 transition-colors"
              aria-label="Retry"
            >
              <RefreshCcw className="h-3.5 w-3.5 text-ink-muted" />
            </button>
          </div>
        </CardContent>
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
    >
      <Card>
        <CardContent className="flex items-center gap-4 pt-4">
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
            <p className="text-sm font-semibold text-ink">Profile Strength</p>
            <CardDescription className="mt-0.5">
              {complete} of {TOTAL_CHECK_FIELDS} fields complete
            </CardDescription>
            {priorityMissing.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {priorityMissing.map((field) => (
                  <span
                    key={field}
                    className="inline-flex items-center gap-1 text-2xs text-muted-foreground bg-cream rounded-full px-2 py-1"
                  >
                    <Circle className="h-2 w-2 text-ink-muted/50" />
                    {fieldLabel(field)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Link
            href="/talent/profile?edit=1"
            className="rounded-xl bg-cream hover:bg-cream-hover text-ink text-xs font-medium px-4 h-8 inline-flex items-center gap-1.5 transition-colors w-full justify-center"
          >
            Complete profile <ChevronRight className="h-3 w-3" />
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
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
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-8 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    { label: "7d Views", value: views7d, icon: Eye, tone: "bg-gold-soft text-gold-ink" },
    { label: "30d Views", value: views30d, icon: CalendarDays, tone: "bg-blue-light text-blue" },
    { label: "Messages", value: messages, icon: Inbox, tone: "bg-green-light text-green" },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 + i * 0.08, ease: "easeOut" }}
        >
          <Card className="py-3">
            <CardContent className="flex flex-col items-center gap-2">
              <div className={cn("h-8 w-8 rounded-full inline-flex items-center justify-center shrink-0", item.tone)}>
                <item.icon className="h-3.5 w-3.5" />
              </div>
              <p className="text-xl font-serif font-bold text-card-foreground tabular-nums">
                {item.value.toLocaleString()}
              </p>
              <p className="text-2xs uppercase tracking-[0.12em] text-muted-foreground font-medium">
                {item.label}
              </p>
            </CardContent>
          </Card>
        </motion.div>
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
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.28, ease: "easeOut" }}
      >
        <Card className="py-2.5">
          <CardContent className="flex items-center gap-2.5">
            <Skeleton className="h-4 w-48 rounded-full" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.28, ease: "easeOut" }}
      >
        <Card className="py-2.5">
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 text-error shrink-0" />
            Plan info unavailable
            <button onClick={() => refetch()} className="ml-auto text-gold text-xs font-medium hover:underline">
              Retry
            </button>
          </CardContent>
        </Card>
      </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.28, ease: "easeOut" }}
    >
      <Link href="/talent/billing" className="block group">
        <Card className="py-2.5 transition-shadow group-hover:shadow-md">
          <CardContent className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-gold-soft inline-flex items-center justify-center shrink-0">
              <Zap className="h-3.5 w-3.5 text-gold" />
            </div>
            <span
              className={cn(
                "text-xs font-semibold rounded-full px-2.5 py-0.5",
                isFree
                  ? "bg-muted text-muted-foreground"
                  : "bg-gold-soft text-gold-ink",
              )}
            >
              {plan?.display_name || "Free"}
            </span>
            {!isFree && (
              <>
                <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
                <span className="text-xs text-muted-foreground">{status === "active" ? "Active" : status}</span>
              </>
            )}
            {endDate && (
              <span className="text-xs text-muted-foreground ml-auto">
                Renews {endDate}
              </span>
            )}
            {isFree && (
              <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-gold group-hover:text-gold-hover transition-colors">
                Upgrade <ChevronRight className="h-3 w-3" />
              </span>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
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
        <Card>
          <CardContent className="flex flex-col items-center text-center pt-0">
            <div className="h-10 w-10 rounded-full bg-gold-soft inline-flex items-center justify-center mb-3">
              <Compass className="h-5 w-5 text-gold-ink" />
            </div>
            <p className="text-sm font-semibold text-ink">No recommendations yet</p>
            <CardDescription className="mt-1 max-w-[240px]">
              Complete your profile to get matched with verified opportunities.
            </CardDescription>
            <Link
              href="/talent/profile?edit=1"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold to-gold-light text-white text-xs font-medium px-5 h-9 shadow-[0_6px_18px_-8px_oklch(0.74_0.13_80/0.7)] hover:brightness-105 transition-all"
            >
              Complete profile
            </Link>
          </CardContent>
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
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-xs font-medium transition-all",
              a.primary
                ? "bg-gradient-to-b from-gold to-gold-light text-white shadow-[0_6px_18px_-8px_oklch(0.74_0.13_80/0.7)] hover:brightness-105"
                : "bg-card shadow-sm text-muted-foreground hover:text-foreground hover:shadow-md",
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
