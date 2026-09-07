"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BookmarkPlus,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  MapPin,
  MessageSquare,
  Mic,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useRecruiterDashboardStats, useRecruiterProfile, useRecruiterSubscription, useRecruiterUsage, useDashboardTalentRecommendations } from "@/hooks/use-recruiter-dashboard";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getDisplayName(user: { email?: string; username?: string } | null) {
  return user?.username || user?.email?.split("@")[0] || "Recruiter";
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function SectionHeading({ title, subtitle, href = "#" }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="flex items-start justify-between px-1">
      <div>
        <h2 className="text-[1.35rem] font-extrabold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <Link href={href} className="pt-1 text-sm font-semibold text-accent-teal transition-colors hover:text-primary">
        View all
      </Link>
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className || ""}`} />;
}

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { data: profile } = useRecruiterProfile();
  const { data: stats, isLoading: loadingStats } = useRecruiterDashboardStats();
  const { data: subscriptionResponse, isLoading: loadingSubscription } = useRecruiterSubscription();
  const { data: usage, isLoading: loadingUsage } = useRecruiterUsage();
  const { data: recommendations, isLoading: loadingRecommendations } = useDashboardTalentRecommendations(4);

  const displayName = getDisplayName(user);
  const subscription = subscriptionResponse?.subscription;
  const plan = subscriptionResponse?.plan;
  const messagesUsed = usage?.messages?.used ?? 0;
  const messagesLimit = usage?.messages?.limit ?? 1;
  const campaignsUsed = usage?.campaigns?.used ?? 0;
  const campaignsLimit = usage?.campaigns?.limit ?? 1;
  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const statCards = [
    { value: stats?.active_campaigns ?? 0, label: "Active Campaigns", icon: CalendarDays, className: "icon-teal" },
    { value: stats?.total_applications_this_week ?? 0, label: "New Applications", icon: FileText, className: "icon-violet" },
    { value: stats?.shortlisted_count ?? 0, label: "Shortlisted", icon: Star, className: "icon-amber" },
    { value: stats?.pending_reviews ?? 0, label: "Pending Reviews", icon: ClipboardList, className: "icon-red" },
  ];

  const quickActions = [
    { title: "Create Campaign", subtitle: "Post a new role", icon: Plus, href: "/recruiter/campaigns/new", className: "bg-accent-teal text-accent-foreground" },
    { title: "Find Talent", subtitle: "Search with AI", icon: Search, href: "/recruiter/find-talent", className: "bg-primary text-primary-foreground" },
    { title: "Review Applications", subtitle: "Shortlist & manage", icon: FileText, href: "/recruiter/campaigns", className: "bg-accent-green text-accent-foreground" },
    { title: "Your Messages", subtitle: "Plan your calls", icon: MessageSquare, href: "/recruiter/messages", className: "bg-accent-amber text-primary-foreground" },
  ];

  const talents = recommendations?.data ?? [];
  const activities = [
    { title: `${stats?.pending_reviews ?? 0} applications need review`, subtitle: "Review your active campaigns", icon: ClipboardList, className: "icon-teal", href: "/recruiter/campaigns" },
    { title: `${stats?.total_applications_this_week ?? 0} new applications this week`, subtitle: "Keep your casting pipeline moving", icon: FileText, className: "icon-violet", href: "/recruiter/campaigns" },
    { title: `${stats?.shortlisted_count ?? 0} talents shortlisted`, subtitle: "Your saved casting choices", icon: Star, className: "icon-amber", href: "/recruiter/find-talent" },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-[430px] bg-background pb-8">
      <header className="relative overflow-hidden pb-8">
        <img
          src="/images/casting/casting-hero.jpg"
          alt="Casting team at work"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/60 via-background/75 to-background" />

        <div className="relative px-5 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-teal-bg text-accent-teal">
                <Sparkles className="size-6" strokeWidth={2.4} />
              </span>
              <div>
                <p className="text-2xl font-extrabold leading-none tracking-tight">Rootin</p>
                <p className="mt-1 text-[0.7rem] font-medium text-muted-foreground">People. Talent. Opportunities.</p>
              </div>
            </div>
            <div className="flex size-11 items-center justify-center rounded-full bg-foreground text-sm font-bold text-primary">
              {initials(displayName)}
            </div>
          </div>

          <p className="mt-5 max-w-[11rem] text-lg font-medium italic leading-tight text-foreground/70">Discover Connect Create</p>
          <h1 className="mt-3 text-[1.9rem] font-extrabold tracking-tight">
            {getGreeting()}, {displayName} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-base text-muted-foreground">Great talent creates greater stories.</p>
          {profile?.verification_status === "enterprise" || profile?.verification_status === "trusted_partner" ? (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent-amber/30 bg-accent-amber-bg px-3 py-1 text-xs font-medium text-accent-amber">
              <BadgeCheck className="size-3" /> Verified recruiter
            </span>
          ) : null}

          <Link href="/recruiter/find-talent" className="mt-5 flex items-center gap-3 rounded-3xl bg-card/90 p-3.5 shadow-card backdrop-blur transition-colors hover:bg-card">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-teal-bg text-accent-teal">
              <Sparkles className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.95rem] font-semibold">Who are you looking for?</span>
              <span className="block truncate text-xs text-muted-foreground">Try “Female actor, 25–30, Hindi, Mumbai”</span>
            </span>
            <Mic className="size-5 shrink-0 text-accent-teal" />
            <span className="h-7 w-px bg-border" />
            <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-foreground">
              <SlidersHorizontal className="size-4" />
            </span>
          </Link>
        </div>
      </header>

      <div className="space-y-7 px-4">
        <section className="grid grid-cols-4 gap-2">
          {loadingStats
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="card-surface rounded-2xl p-2.5">
                  <SkeletonBlock className="size-9 rounded-xl" />
                  <SkeletonBlock className="mt-2.5 h-6 w-8" />
                  <SkeletonBlock className="mt-1 h-5 w-full" />
                </div>
              ))
            : statCards.map(({ value, label, icon: Icon, className }) => (
                <Link key={label} href="/recruiter/campaigns" className="card-surface rounded-2xl p-2.5 text-left transition-transform hover:-translate-y-0.5">
                  <span className={`flex size-9 items-center justify-center rounded-xl ${className}`}><Icon className="size-4" /></span>
                  <p className="mt-2.5 text-xl font-extrabold">{value}</p>
                  <div className="mt-0.5 flex items-end justify-between gap-1">
                    <p className="text-[0.7rem] leading-tight text-muted-foreground">{label}</p>
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ))}
        </section>

        <section className="space-y-3">
          <SectionHeading title="Quick Actions" href="/recruiter/campaigns" />
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map(({ title, subtitle, icon: Icon, href, className }) => (
              <Link key={title} href={href} className="card-surface rounded-2xl p-2.5 text-center transition-transform hover:-translate-y-0.5">
                <span className={`mx-auto flex size-9 items-center justify-center rounded-full ${className}`}><Icon className="size-4" /></span>
                <span className="mt-2 block text-[0.72rem] font-bold leading-tight">{title}</span>
                <span className="mt-1 block text-[0.62rem] leading-tight text-muted-foreground">{subtitle}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="card-surface rounded-2xl p-4">
          {loadingSubscription || loadingUsage ? (
            <div className="space-y-4">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-3 w-32" />
              <SkeletonBlock className="h-1 w-full" />
              <SkeletonBlock className="h-1 w-full" />
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wide text-accent-teal">{plan?.display_name?.toUpperCase() ?? "YOUR PLAN"}</span>
                <span className="flex items-center gap-1.5 text-xs text-accent-green"><span className="size-1.5 rounded-full bg-accent-green" />{subscription?.status === "active" ? "Active" : subscription?.status ?? "No plan"}</span>
              </div>
              {renewalDate ? <p className="mb-4 text-xs text-muted-foreground">Renews on {renewalDate}</p> : null}
              {[
                { label: "Messages", used: messagesUsed, limit: messagesLimit },
                { label: "Campaigns", used: campaignsUsed, limit: campaignsLimit },
              ].map(({ label, used, limit }) => (
                <div key={label} className="mb-3 last:mb-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs"><span className="text-foreground/80">{label}</span><span className="text-muted-foreground">{used} / {limit}</span></div>
                  <div className="h-1 overflow-hidden rounded-full bg-accent-purple-track"><div className="h-full rounded-full bg-accent-teal" style={{ width: `${Math.min((used / Math.max(limit, 1)) * 100, 100)}%` }} /></div>
                </div>
              ))}
              <div className="flex gap-2.5">
                <Link href="/recruiter/billing" className="flex-1 rounded-xl border border-accent-teal py-2.5 text-center text-sm font-semibold text-accent-teal hover:bg-accent-teal-bg">Manage plan</Link>
                <Link href="/recruiter/billing" className="flex-1 rounded-xl border border-border py-2.5 text-center text-sm font-semibold text-muted-foreground hover:bg-muted">Billing</Link>
              </div>
            </>
          )}
        </section>

        <section className="space-y-3">
          <SectionHeading title="AI Talent Matches" subtitle="Curated by AI based on your active campaigns" href="/recruiter/find-talent" />
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
            {loadingRecommendations
              ? Array.from({ length: 2 }).map((_, index) => <SkeletonBlock key={index} className="h-[260px] w-[19rem] shrink-0 rounded-2xl" />)
              : talents.length === 0
                ? <div className="card-surface w-full rounded-2xl p-6 text-center text-sm text-muted-foreground">No recommendations yet. Create a campaign to get matched with talent.</div>
                : talents.map((talent, index) => {
                    const name = talent.full_legal_name || talent.username;
                    const photo = talent.profile_photo || (index % 2 === 0 ? "/images/casting/actor-female.jpg" : "/images/casting/actor-male.jpg");
                    const profession = talent.professions?.slice(0, 2).join(" • ") || "Talent";
                    const location = talent.location?.city || talent.location?.state || "India";
                    return (
                      <article key={talent._id} className="card-surface w-[19rem] shrink-0 snap-start rounded-2xl p-3">
                        <div className="flex gap-3">
                          <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl">
                            <img src={photo} alt={name} loading="lazy" className="h-full w-full object-cover" />
                            <span className="absolute left-1.5 top-1.5 rounded-lg bg-accent-teal px-1.5 py-1 text-center text-[0.68rem] font-bold leading-tight text-accent-foreground">{talent.match_score}%<br />Match</span>
                            <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-[0.62rem] font-semibold text-white"><span className="size-1.5 rounded-full bg-accent-green" /> Available</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1"><p className="truncate text-[1.05rem] font-bold">{name}</p><BadgeCheck className="size-4 shrink-0 text-accent-teal" /></div>
                            <p className="text-xs text-muted-foreground">{profession}</p>
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" />{location}</p>
                            <div className="mt-3 flex items-center justify-between gap-2"><div><p className="flex items-center gap-1 text-xs font-semibold"><Star className="size-3.5 fill-warning text-warning" />{talent.match_score}% fit</p><p className="text-xs text-muted-foreground">RootScore</p></div><span className="flex size-10 items-center justify-center rounded-full border-2 border-accent-teal text-sm font-bold text-accent-teal">{talent.match_score}</span></div>
                            <div className="mt-2 flex flex-wrap gap-1.5">{(talent.professions || []).slice(0, 3).map((professionTag) => <span key={professionTag} className="rounded-full bg-secondary px-2 py-1 text-[0.68rem] font-medium text-secondary-foreground">{professionTag}</span>)}</div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2.5">
                          <Link href={`/talent/${talent.username}`} className="rounded-xl border border-accent-teal py-2.5 text-center text-sm font-semibold text-accent-teal">View Profile</Link>
                          <Link href={`/talent/${talent.username}`} className="flex items-center justify-center gap-1.5 rounded-xl bg-accent-teal py-2.5 text-sm font-semibold text-accent-foreground"><BookmarkPlus className="size-4" /> Shortlist</Link>
                        </div>
                      </article>
                    );
                  })}
          </div>
        </section>

        <section className="space-y-2">
          <SectionHeading title="Recent Activity" href="/recruiter/notifications" />
          <ul className="divide-y divide-border rounded-2xl bg-card px-4 shadow-card">
            {activities.map(({ title, subtitle, icon: Icon, className, href }) => (
              <li key={title}>
                <Link href={href} className="flex items-center gap-3 py-4">
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${className}`}><Icon className="size-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-[0.95rem] font-semibold leading-snug">{title}</span><span className="block text-xs text-muted-foreground">{subtitle}</span></span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <button
          type="button"
          onClick={async () => { await logout(); router.push("/auth/login"); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card p-3.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
        >
          <User className="size-4" /> Log out
        </button>
      </div>
    </main>
  );
}
