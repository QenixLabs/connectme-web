"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  Search,
  Bookmark,
  Send,
  MessageSquare,
  Star,
  Pencil,
  BadgeCheck,
  MapPin,
  Globe,
  Share2,
  CalendarDays,
  Folder,
  Mail,
  Phone,
  ChevronRight,
  TrendingUp,
  Building2,
  Users,
  Wallet,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useAuthStore } from "@/providers/auth-store-provider";
import { getConversationParticipant } from "@/lib/messages";
import {
  useTalentProfile,
  useTalentCompleteness,
  useCampaignRecommendations,
  useDashboardNotifications,
  useUnreadMessages,
  useTalentApplicationStats,
  useRecentConversations,
} from "@/hooks/use-talent-dashboard";
import { DashboardSkeleton } from "./DashboardSkeleton";

function getInitials(name?: string | null) {
  if (!name) return "ME";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatBudget(min?: number, max?: number, currency = "INR") {
  if (min == null && max == null) return "Not disclosed";
  const symbol = currency === "INR" ? "₹" : "$";
  if (min != null && max != null) return `${symbol}${min.toLocaleString("en-IN")}K – ${symbol}${max.toLocaleString("en-IN")}K`;
  if (min != null) return `${symbol}${min.toLocaleString("en-IN")}K+`;
  return `Up to ${symbol}${max?.toLocaleString("en-IN")}K`;
}

function AvatarPlaceholder({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-primary/70 to-primary font-semibold text-primary-foreground ${className ?? ""}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function Ring({
  percent,
  size = 84,
  stroke = 8,
  label,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.26 300)" />
            <stop offset="100%" stopColor="oklch(0.48 0.24 277)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="fill-none stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          stroke="url(#ringGrad)"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * percent) / 100}
          className="fill-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold leading-none text-foreground">
          {percent}%
        </span>
        {label && (
          <span className="mt-0.5 text-center text-[9px] leading-tight text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-xs font-semibold text-primary"
        >
          View All <ChevronRight className="size-3.5" />
        </Link>
      ) : (
        <button className="flex items-center gap-0.5 text-xs font-semibold text-primary">
          View All <ChevronRight className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function calculateCompleteness(missingFields: string[] | undefined): number {
  if (!missingFields) return 0;
  return Math.round(((30 - missingFields.length) / 30) * 100);
}

export function DashboardContent() {
  const user = useAuthStore((s) => s.user);

  const { data: profile, isPending: loadingProfile } = useTalentProfile();
  const { data: completenessData, isPending: loadingCompleteness } =
    useTalentCompleteness();
  const { data: recommendations, isPending: loadingRecommendations } =
    useCampaignRecommendations();
  const { data: notifications, isPending: loadingNotifications } =
    useDashboardNotifications();
  const { data: unreadData, isPending: loadingUnread } = useUnreadMessages();
  const { data: applicationStats, isPending: loadingApplicationStats } =
    useTalentApplicationStats();
  const { data: conversations, isPending: loadingConversations } =
    useRecentConversations();

  const isLoading =
    loadingProfile ||
    loadingCompleteness ||
    loadingRecommendations ||
    loadingNotifications ||
    loadingUnread ||
    loadingApplicationStats ||
    loadingConversations;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const completeness = calculateCompleteness(completenessData?.missingFields);
  const unreadCount = unreadData?.count ?? 0;

  const name = profile?.full_legal_name || user?.username || "Talent";
  const initials = getInitials(name);
  const locationStr = [profile?.location?.city, profile?.location?.state]
    .filter(Boolean)
    .join(", ");
  const professionsStr = profile?.professions?.join(" · ") || "Artist";
  const isVerified = profile?.is_verified ?? false;
  const isAvailable = profile?.availability === "available";
  const isPublic = profile?.privacy_mode === "public";

  const stats = [
    {
      icon: Eye,
      value: (profile?.analytics?.profile_views_30d ?? 0).toLocaleString("en-IN"),
      label: "Views",
      change: "12%",
      color: "text-accent-green",
    },
    {
      icon: Search,
      value: "0",
      label: "Searches",
      change: "18%",
      color: "text-accent-green",
    },
    {
      icon: Bookmark,
      value: (profile?.analytics?.shortlist_count ?? 0).toLocaleString("en-IN"),
      label: "Shortlists",
      change: "15%",
      color: "text-accent-amber",
    },
    {
      icon: Send,
      value: "0",
      label: "Shares",
      change: "10%",
      color: "text-primary",
    },
    {
      icon: MessageSquare,
      value: unreadCount.toString(),
      label: "Messages",
      change: "8%",
      color: "text-primary",
    },
    {
      icon: Star,
      value: (recommendations?.length ?? 0).toString(),
      label: "Opportunities",
      change: "20%",
      color: "text-accent-amber",
    },
  ];

  const inviteCount =
    notifications?.filter(
      (n) => n.type === "campaign_invite" && n.status === "unread",
    ).length ?? 0;

  const actions = [
    {
      icon: CalendarDays,
      value: (applicationStats?.auditions ?? 0).toString(),
      label: "Auditions",
      sub: "Due this week",
      iconClass: "bg-accent-purple/15 text-primary",
    },
    {
      icon: MessageSquare,
      value: unreadCount.toString(),
      label: "Messages",
      sub: "Unread",
      iconClass: "bg-blue/15 text-blue",
    },
    {
      icon: Folder,
      value: "0",
      label: "Media Request",
      sub: "Pending",
      iconClass: "bg-accent-amber/15 text-accent-amber",
    },
    {
      icon: Mail,
      value: inviteCount.toString(),
      label: "Invitations",
      sub: "New",
      iconClass: "bg-accent-green/15 text-accent-green",
    },
  ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-md pb-10">
      {/* Profile card */}
      <section className="mx-4 mt-4 rounded-[20px] border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Left column: image + verified badge */}
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <Link
              href={profile?.username ? `/talent/${profile.username}` : "/talent/profile"}
              className="relative block cursor-pointer rounded-full transition-opacity hover:opacity-80"
            >
              <div className="rounded-full bg-gradient-to-br from-fuchsia-500 via-primary to-indigo-500 p-[3px]">
                {profile?.profile_photo ? (
                  <div className="relative size-[96px] overflow-hidden rounded-full">
                    <Image
                      src={profile.profile_photo}
                      alt={name}
                      fill
                      unoptimized
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <AvatarPlaceholder initials={initials} className="size-[96px] text-2xl" />
                )}
              </div>
              <span
                className="absolute -right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground"
              >
                <Pencil className="size-2.5" />
              </span>
              {isVerified && (
                <span className="absolute -bottom-0.5 -right-0.5 flex size-[22px] items-center justify-center rounded-full border-2 border-card bg-accent-green text-white">
                  <BadgeCheck className="size-3.5" />
                </span>
              )}
            </Link>
            {isVerified && (
              <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-accent-purple/15 px-2 py-[3px] text-[9px] font-semibold leading-none text-primary">
                <BadgeCheck className="size-3 shrink-0" /> Verified Talent
              </span>
            )}
          </div>
          {/* Center: profile info */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] leading-tight text-muted-foreground">
              Good evening, 👋
            </p>
            <div className="mt-0.5 flex items-center gap-1">
              <Link href={profile?.username ? `/talent/${profile.username}` : "/talent/profile"}>
                <h1 className="cursor-pointer whitespace-nowrap text-base font-bold leading-tight text-foreground transition-opacity hover:opacity-80">
                  {name}
                </h1>
              </Link>
              {isVerified && (
                <BadgeCheck className="size-4 shrink-0 fill-primary text-primary-foreground" />
              )}
            </div>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
              {professionsStr}
            </p>
            {locationStr && (
              <p className="mt-1 flex items-center gap-1 whitespace-nowrap text-[11px] leading-tight text-muted-foreground">
                <MapPin className="size-3 shrink-0" /> {locationStr}
              </p>
            )}
            <div className="mt-1.5 flex flex-nowrap items-center gap-1.5">
              <span
                className={`flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-1.5 text-[8.5px] font-semibold ${
                  isAvailable
                    ? "bg-accent-green/15 text-accent-green"
                    : "bg-accent-amber/15 text-accent-amber"
                }`}
              >
                <span
                  className={`size-1.5 shrink-0 rounded-full ${isAvailable ? "bg-accent-green" : "bg-accent-amber"}`}
                />{" "}
                {isAvailable ? "Available for Work" : "Not Available"}
              </span>
              <span className="flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-blue/15 px-1.5 text-[8.5px] font-semibold text-blue">
                <Send className="size-2.5 shrink-0" /> Open to Travel
              </span>
            </div>
            <p className="mt-1.5 flex items-center gap-1 whitespace-nowrap text-[10px] leading-tight text-muted-foreground">
              <Globe className="size-3 shrink-0" /> Profile visibility:{" "}
              <span className="font-semibold text-accent-green">
                {isPublic ? "Public" : "Limited"}
              </span>
            </p>
          </div>
          {/* Right: profile strength */}
          <div className="shrink-0 self-start">
            <Ring percent={completeness} size={64} stroke={6} />
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <Link
            href={profile?.username ? `/talent/${profile.username}` : "/talent/profile"}
            className="flex h-10 flex-[36] items-center justify-center gap-1.5 rounded-xl border border-primary/30 text-[11px] font-semibold text-primary"
          >
            <Eye className="size-3.5 shrink-0" /> View Profile
          </Link>
          <Link
            href="/talent/profile"
            className="flex h-10 flex-[50] items-center justify-center gap-1.5 rounded-xl bg-primary text-[11px] font-semibold text-primary-foreground"
          >
            <Pencil className="size-3.5 shrink-0" /> Edit Profile
          </Link>
          <button className="flex h-10 w-[48px] shrink-0 items-center justify-center rounded-xl border text-muted-foreground">
            <Share2 className="size-4" />
          </button>
        </div>
      </section>

      {/* Career Performance */}
      <section className="mx-4 mt-4">
        <SectionHeader title="Career Performance" />
        <div className="mt-2 grid grid-cols-6 gap-1 rounded-2xl border bg-card p-3 shadow-sm">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 text-center">
              <s.icon className="size-4 text-muted-foreground" />
              <span className="text-sm font-extrabold text-foreground">{s.value}</span>
              <span className="text-[8px] leading-tight text-muted-foreground">{s.label}</span>
              <span className={`flex items-center text-[8px] font-semibold ${s.color}`}>
                <TrendingUp className="size-2" /> {s.change}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Top Opportunities */}
      <section className="mx-4 mt-5">
        <SectionHeader title="Top Opportunities for You" href="/talent/opportunities" />
        <div className="mt-2 space-y-3">
          {(recommendations ?? []).slice(0, 3).map((o) => {
            const opportunityInitials = getInitials(o.name);
            const match = Math.round(o.match_score ?? o.total_score ?? 0);
            const isHighMatch = match >= 90;
            const isGoodMatch = match >= 80;
            const matchColor = isHighMatch
              ? "text-primary"
              : isGoodMatch
                ? "text-accent-green"
                : "text-blue";
            const budget = formatBudget(
              o.budget_range?.min,
              o.budget_range?.max,
              o.budget_range?.currency,
            );
            const postedAt = formatDistanceToNow(new Date(o.created_at), {
              addSuffix: true,
            });
            const companyName = o.recruiter?.company_name;
            const skills = (
              o.requirements?.skills?.length
                ? o.requirements.skills
                : o.specialties ?? []
            ).slice(0, 3);
            const profileSkillSet = new Set(
              (profile?.specialties ?? []).map((s) => s.toLowerCase()),
            );
            const matchedCount = skills.filter((s) =>
              profileSkillSet.has(s.toLowerCase()),
            ).length;

            return (
              <Link
                key={o._id}
                href={`/talent/opportunities/${o._id}`}
                className="group flex items-stretch gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-colors hover:border-primary/30 hover:bg-accent-purple/5"
              >
                <AvatarPlaceholder
                  initials={opportunityInitials}
                  className="size-16 shrink-0 self-center rounded-xl text-sm"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[13px] font-bold leading-tight text-foreground">
                    {o.name || "New Opportunity"}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                    <Building2 className="size-3 shrink-0" />
                    <span className="truncate">
                      {companyName
                        ? `${companyName} · ${postedAt}`
                        : `Posted ${postedAt}`}
                    </span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-accent-purple/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                      {o.role_type || "Full Time"}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="size-3" />
                      {o.location?.city || "Remote"}
                    </span>
                    {budget !== "Not disclosed" && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Wallet className="size-3" />
                        {budget}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Users className="size-3" />
                      {o.applications_count} applied
                    </span>
                  </div>
                  {skills.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="truncate rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[9px] font-medium text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-center justify-center gap-1 self-center">
                  <div className="rounded-xl bg-accent-purple/15 px-2.5 py-1.5 text-center">
                    <p
                      className={`text-sm font-extrabold leading-none ${matchColor}`}
                    >
                      {match}%
                    </p>
                    <p className="mt-0.5 text-[8px] font-semibold text-muted-foreground">
                      {matchedCount > 0
                        ? `${matchedCount} skills matched`
                        : "Match"}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/60" />
                </div>
              </Link>
            );
          })}
          {(recommendations ?? []).length === 0 && (
            <div className="rounded-2xl border bg-card p-4 text-center text-sm text-muted-foreground">
              No matching opportunities right now. Complete your profile to get better recommendations.
            </div>
          )}
        </div>
      </section>

      {/* Application Tracker */}
      <section className="mx-4 mt-5">
        <SectionHeader title="Application Tracker" />
        <div className="mt-2 flex items-center justify-between rounded-2xl border bg-card p-4 shadow-sm">
          {[
            {
              icon: Send,
              value: (applicationStats?.applied ?? 0).toString(),
              label: "Applied",
              cls: "text-primary bg-accent-purple/15",
            },
            {
              icon: Eye,
              value: (applicationStats?.viewed ?? 0).toString(),
              label: "Viewed",
              cls: "text-blue bg-blue/15",
            },
            {
              icon: Bookmark,
              value: (applicationStats?.shortlisted ?? 0).toString(),
              label: "Shortlisted",
              cls: "text-accent-amber bg-accent-amber/15",
            },
            {
              icon: CalendarDays,
              value: (applicationStats?.auditions ?? 0).toString(),
              label: "Auditions",
              cls: "text-rose bg-rose/15",
            },
            {
              icon: Phone,
              value: (applicationStats?.callbacks ?? 0).toString(),
              label: "Callback",
              cls: "text-accent-green bg-accent-green/15",
            },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              {i > 0 && <span className="text-[10px] text-muted-foreground">→</span>}
              <div className="flex flex-col items-center gap-1">
                <span className={`flex size-8 items-center justify-center rounded-full ${s.cls}`}>
                  <s.icon className="size-3.5" />
                </span>
                <span className="text-xs font-extrabold text-foreground">{s.value}</span>
                <span className="text-[8px] text-muted-foreground">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Action Required */}
      <section className="mx-4 mt-5">
        <SectionHeader title="Action Required" />
        <div className="mt-2 grid grid-cols-4 gap-2">
          {actions.map((a) => (
            <div
              key={a.label}
              className="flex flex-col items-center gap-1.5 rounded-2xl border bg-card p-3 text-center shadow-sm"
            >
              <span className={`flex size-9 items-center justify-center rounded-xl ${a.iconClass}`}>
                <a.icon className="size-4" />
              </span>
              <span className="text-base font-extrabold leading-none text-foreground">{a.value}</span>
              <span className="text-[9px] font-semibold leading-tight text-foreground">{a.label}</span>
              <span className="text-[8px] leading-tight text-muted-foreground">{a.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Profile Strength */}
      <section className="mx-4 mt-5">
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
          <Ring percent={completeness} size={72} stroke={7} />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground">Profile Strength</h3>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              You&apos;re almost there! Complete your profile and get more opportunities.
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-primary" style={{ width: `${completeness}%` }} />
            </div>
            <p className="mt-1 text-[10px] font-semibold text-primary">
              {(completenessData?.missingFields?.length ?? 0)} steps left to complete
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </section>

      {/* Recent Messages */}
      <section className="mx-4 mt-5">
        <SectionHeader title="Recent Messages" />
        <div className="mt-2 space-y-2">
          {(conversations ?? []).map((m) => {
            const participant = getConversationParticipant(m, user?._id);
            const displayName =
              participant?.full_legal_name ||
              participant?.company_name ||
              participant?.username ||
              "Unknown";
            const participantInitials = getInitials(displayName);
            const myUnread = user?._id ? (m.unread_counts?.[user._id] ?? 0) : 0;
            return (
              <Link
                key={m._id}
                href={`/talent/messages/${m._id}`}
                className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm"
              >
                {participant?.profile_photo ? (
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={participant.profile_photo}
                      alt={displayName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <AvatarPlaceholder initials={participantInitials} className="size-11 text-xs" />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-bold text-foreground">{displayName}</h3>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {m.last_message_preview || "No messages yet"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[9px] text-muted-foreground">
                    {m.last_message_at
                      ? formatDistanceToNow(new Date(m.last_message_at), { addSuffix: true })
                      : ""}
                  </span>
                  {myUnread > 0 && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {myUnread > 9 ? "9+" : myUnread}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
          {(conversations ?? []).length === 0 && (
            <div className="rounded-2xl border bg-card p-4 text-center text-sm text-muted-foreground">
              No messages yet. Start a conversation from an opportunity.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
