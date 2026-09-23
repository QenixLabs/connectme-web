"use client";

/**
 * Recruiter dashboard — visual port of screenshot-exact `src/routes/index.tsx`
 * wired to real backend data.
 *
 * Layout follows the source screen section-by-section (brand header, greeting
 * hero, metrics strip, AI copilot, quick actions, priority tasks, AI matches,
 * active campaigns, closing note). Two source-only elements are intentionally
 * dropped because the app shell already provides them: the phone status bar
 * (9:41 / signal icons) and the fixed bottom nav (see recruiter-app layout
 * `TopBar` + `BottomBar`).
 *
 * Artwork: the source's Lovable-hosted PNGs were never exported, so the hero
 * and copilot art use existing local images; the talent/campaign film strips
 * are copied from the source repo into
 * `public/assets/recruiter-dashboard/`.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
  Film,
  Folder,
  Hand,
  Lightbulb,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/providers/auth-store-provider";
import { hasSeenRecruiterWelcome } from "@/lib/recruiter-welcome";
import {
  useDashboardTalentRecommendations,
  useRecruiterDashboardStats,
  useRecruiterProfile,
} from "@/hooks/use-recruiter-dashboard";
import { useRecruiterCampaigns } from "@/hooks/use-campaigns";
import { talentApi } from "@/lib/api/talent";
import type { Campaign } from "@/lib/api/campaigns";
import type { DashboardTalentRecommendation } from "@/lib/api/recommendations";

const TALENT_STRIP = "/assets/recruiter-dashboard/talent-strip.jpg";
const CAMPAIGN_STRIP = "/assets/recruiter-dashboard/campaign-strip.jpg";
const HERO_SRC = "/images/casting/casting-hero.png";
const ROBOT_SRC = "/images/casting/cute-neon-robot-pointing-up.png";

const STRIP_CROPS = ["strip-first", "strip-second", "strip-third"] as const;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function firstNameOf(user: { username?: string; email?: string } | null, fallback: string) {
  const raw = user?.username || user?.email?.split("@")[0] || fallback;
  const first = raw.split(" ")[0] || fallback;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function daysUntilDeadline(value?: string): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((target.getTime() - startOfToday.getTime()) / 86_400_000);
}

function deadlineLabel(deadline?: string): string {
  const days = daysUntilDeadline(deadline);
  if (days === null) return "No deadline set";
  if (days < 0) return "Deadline passed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
}

function SectionTitle({
  children,
  href,
  chevron = false,
}: {
  children: string;
  href: string;
  chevron?: boolean;
}) {
  return (
    <div className="mb-2 flex items-center justify-between px-0.5">
      <h2 className="text-base font-extrabold text-foreground">{children}</h2>
      <Button variant="ghost" size="sm" className="h-7 gap-0.5 px-1 text-[11px] font-bold text-primary" asChild>
        <Link href={href}>
          View All {chevron && <ChevronRight className="size-3.5" />}
        </Link>
      </Button>
    </div>
  );
}

function StripImage({ source, crop, alt }: { source: string; crop: string; alt: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={source}
        alt={alt}
        className={`absolute inset-y-0 h-full w-[300%] max-w-none object-cover ${crop}`}
        loading="lazy"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shortlist picker — same flow as find-talent: pick an active campaign       */
/* -------------------------------------------------------------------------- */

function ShortlistPicker({
  talent,
  open,
  onOpenChange,
}: {
  talent: DashboardTalentRecommendation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { data: campaignsData, isLoading } = useRecruiterCampaigns({ status: "active", limit: 20 });

  const campaigns = useMemo(
    () => campaignsData?.pages.flatMap((page) => page.data) ?? [],
    [campaignsData],
  );

  const confirm = async () => {
    if (!talent || !campaignId || pending) return;
    setPending(true);
    try {
      await talentApi.shortlistTalent(talent.username, campaignId);
      toast.success(`Shortlisted ${talent.full_legal_name || talent.username}`);
      queryClient.invalidateQueries({ queryKey: ["shortlists"] });
      queryClient.invalidateQueries({ queryKey: ["talent-shortlist"] });
      onOpenChange(false);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Failed to shortlist talent";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setCampaignId(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Shortlist {talent?.full_legal_name || talent?.username || "talent"}
          </DialogTitle>
          <DialogDescription>
            Pick one of your active campaigns. The talent will appear under Shortlisted for that
            campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </>
          ) : campaigns.length === 0 ? (
            <div className="rounded-xl border bg-muted p-4 text-sm text-muted-foreground">
              No active campaigns yet.{" "}
              <Link
                href="/recruiter/campaigns/new"
                className="font-semibold text-primary hover:underline"
              >
                Create one
              </Link>{" "}
              to shortlist talent.
            </div>
          ) : (
            campaigns.map((campaign) => {
              const selected = campaignId === campaign._id;
              return (
                <button
                  key={campaign._id}
                  type="button"
                  onClick={() => setCampaignId(campaign._id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${
                      selected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Briefcase className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{campaign.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[campaign.role_type, campaign.location?.city].filter(Boolean).join(" • ")}
                    </span>
                  </span>
                  {selected && <Check className="size-5 shrink-0 text-primary" />}
                </button>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!campaignId || pending}
            onClick={confirm}
            className="w-full sm:w-auto"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Confirm shortlist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

interface PriorityTask {
  title: string;
  project: string;
  due: string;
  urgent: boolean;
  href: string;
  icon: LucideIcon;
  tone: string;
}

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useRecruiterProfile();
  const { data: stats, isLoading: loadingStats } = useRecruiterDashboardStats();
  const { data: recommendations, isLoading: loadingRecommendations } =
    useDashboardTalentRecommendations(6);
  const { data: campaignsData, isLoading: loadingCampaigns } = useRecruiterCampaigns({
    status: "active",
    limit: 6,
  });
  const [copilotQuery, setCopilotQuery] = useState("");
  const [shortlistTarget, setShortlistTarget] = useState<DashboardTalentRecommendation | null>(null);

  // Fresh signups (e.g. verified on another device, where the localStorage
  // "seen" flag doesn't exist yet) get the one-time welcome screen first.
  useEffect(() => {
    if (!user || hasSeenRecruiterWelcome(user)) return;
    const createdAt = user.created_at ? Date.parse(user.created_at) : NaN;
    if (!Number.isNaN(createdAt) && Date.now() - createdAt < 15 * 60 * 1000) {
      router.replace("/recruiter/welcome");
    }
  }, [user, router]);

  const campaigns: Campaign[] = useMemo(
    () => campaignsData?.pages.flatMap((page) => page.data) ?? [],
    [campaignsData],
  );

  const displayName = firstNameOf(
    user,
    profile?.contact_name || profile?.company_name || "Recruiter",
  );

  const activeCampaigns = stats?.active_campaigns ?? 0;
  const applicationsThisWeek = stats?.total_applications_this_week ?? 0;
  const shortlistedCount = stats?.shortlisted_count ?? 0;
  const pendingReviews = stats?.pending_reviews ?? 0;

  const metrics = [
    {
      value: activeCampaigns,
      label: "Active Campaigns",
      icon: Folder,
      tone: "metric-purple",
      href: "/recruiter/campaigns",
    },
    {
      value: applicationsThisWeek,
      label: "Applications",
      icon: FileText,
      tone: "metric-blue",
      href: "/recruiter/campaigns",
    },
    {
      value: shortlistedCount,
      label: "Shortlisted",
      icon: Star,
      tone: "metric-gold",
      href: "/recruiter/shortlist",
    },
    {
      value: pendingReviews,
      label: "To Review",
      icon: ClipboardList,
      tone: "metric-green",
      href: "/recruiter/campaigns",
    },
  ];

  const quickActions = [
    { label: "Find Talent", icon: Search, tone: "metric-blue", href: "/recruiter/find-talent" },
    {
      label: "Review Applications",
      icon: FileText,
      tone: "metric-purple",
      href: "/recruiter/campaigns",
    },
    {
      label: "Compare Candidates",
      icon: Users,
      tone: "metric-indigo",
      href: "/recruiter/compare",
    },
    { label: "Create Campaign", icon: Film, tone: "metric-pink", href: "/recruiter/campaigns/new" },
  ];

  const [firstCampaign, secondCampaign, thirdCampaign] = campaigns;

  const tasks: PriorityTask[] = [
    {
      title:
        pendingReviews > 0
          ? `Review ${pendingReviews} new application${pendingReviews === 1 ? "" : "s"}`
          : "Review applications",
      project: firstCampaign
        ? `${firstCampaign.name}${firstCampaign.role_type ? ` – ${firstCampaign.role_type}` : ""}`
        : "Active campaigns",
      due: pendingReviews > 0 ? "Today" : "This week",
      urgent: pendingReviews > 0,
      href: firstCampaign
        ? `/recruiter/campaigns/${firstCampaign._id}/applications`
        : "/recruiter/campaigns",
      icon: FileText,
      tone: "metric-red",
    },
    {
      title:
        shortlistedCount > 0
          ? `${shortlistedCount} talent${shortlistedCount === 1 ? "" : "s"} shortlisted`
          : "Shortlist top talent",
      project: secondCampaign?.name ?? firstCampaign?.name ?? "AI talent matches",
      due: "Today",
      urgent: false,
      href: "/recruiter/shortlist",
      icon: Bookmark,
      tone: "metric-orange",
    },
    {
      title: "Schedule auditions",
      project: thirdCampaign?.name ?? secondCampaign?.name ?? "Upcoming auditions",
      due: "Tomorrow",
      urgent: false,
      href: "/recruiter/invites",
      icon: CalendarDays,
      tone: "metric-purple",
    },
    {
      title: "Complete campaign brief",
      project: "New casting brief",
      due: "Tomorrow",
      urgent: false,
      href: "/recruiter/campaigns/new",
      icon: ClipboardList,
      tone: "metric-green",
    },
  ];

  const talents = recommendations?.data ?? [];
  const maxCampaignApplications = campaigns.reduce(
    (max, campaign) => Math.max(max, campaign.applications_count ?? 0),
    0,
  );

  const handleCopilotSubmit = (event: FormEvent) => {
    event.preventDefault();
    const query = copilotQuery.trim();
    // The results page parses `q` into real search criteria (see
    // lib/find-talent/search-model), so this runs a genuine keyword search.
    router.push(query ? `/recruiter/find-talent/results?q=${encodeURIComponent(query)}` : "/recruiter/find-talent/ai-search");
  };

  return (
    <div className="recruiter-dashboard-theme min-h-full bg-background">
      <main className="mx-auto min-h-screen w-full max-w-md overflow-x-hidden bg-background pb-8 shadow-app">
        <div className="px-4">
          <section className="relative -mx-4 h-40 overflow-hidden">
            <div className="relative z-10 w-[56%] px-4 pt-3">
              <p className="text-sm font-medium">{getGreeting()},</p>
              <h1 className="mt-0.5 flex items-center gap-1.5 text-[28px] font-extrabold leading-none text-brand-ink">
                {displayName}{" "}
                <Hand className="size-6 rotate-[-18deg] fill-warning text-warning" aria-label="Waving" />
              </h1>
              <p className="mt-2 text-xs font-medium leading-snug text-muted-foreground">
                Great projects start with great people.
                <br />
                Let&apos;s find your next perfect match.
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_SRC}
              alt="Film director operating a cinema camera"
              className="absolute bottom-2.5 right-0 h-[148px] w-[74%] object-contain object-right-bottom [mask-image:linear-gradient(to_right,transparent,black_22%),linear-gradient(to_top,transparent,black_20%)]"
              loading="eager"
            />
            <p className="script absolute right-3 top-11 z-10 rotate-[-8deg] text-center text-[18px] leading-[0.9] text-brand-ink">
              Right
              <br />
              People.
              <br />
              Bigger
              <br />
              Stories.
            </p>
          </section>

          <section
            className="relative z-20 -mt-2 grid grid-cols-4 rounded-xl border border-border bg-card px-2 py-3 shadow-panel"
            aria-label="Casting summary"
          >
            {loadingStats
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex min-w-0 items-center justify-center gap-1.5 border-r border-border px-1 last:border-r-0"
                  >
                    <Skeleton className="size-8 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="mt-1 h-2.5 w-full" />
                    </div>
                  </div>
                ))
              : metrics.map(({ value, label, icon: Icon, tone, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex min-w-0 items-center justify-center gap-1.5 border-r border-border px-1 last:border-r-0"
                  >
                    <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone}`}>
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15px] font-extrabold leading-none">{value}</p>
                      <p className="mt-1 text-[8px] leading-tight text-muted-foreground">{label}</p>
                    </div>
                  </Link>
                ))}
          </section>

          <section className="relative mt-3 overflow-hidden rounded-xl border border-primary/10 bg-copilot p-3 shadow-panel">
            <div className="relative z-10 w-[68%]">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="text-sm font-extrabold text-brand-ink">AI Casting Copilot</h2>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[8px] font-extrabold text-primary">
                  BETA
                </span>
              </div>
              <h3 className="mt-2 text-lg font-extrabold leading-tight text-brand-ink">
                What are you casting today?
              </h3>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Tell me your project, role or talent need. I&apos;ll help you find the best matches.
              </p>
            </div>
            <p className="script absolute right-[72px] top-10 z-10 rotate-[-8deg] text-center text-[12px] leading-[0.9] text-primary">
              Smarter
              <br />
              Casting
              <br />
              Faster Results
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ROBOT_SRC}
              alt="Rootin AI casting assistant"
              className="absolute -right-3 top-9 h-28 w-28 object-contain"
              loading="eager"
            />
            <form
              onSubmit={handleCopilotSubmit}
              className="relative z-20 mt-3 flex h-10 items-center rounded-lg bg-card pl-3 shadow-sm"
            >
              <Search className="size-4 shrink-0 text-primary" />
              <label htmlFor="copilot-query" className="sr-only">
                Describe your casting need
              </label>
              <input
                id="copilot-query"
                value={copilotQuery}
                onChange={(event) => setCopilotQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-2 text-[10px] outline-none placeholder:text-muted-foreground"
                placeholder="Try “Female actor, 25–30, Hindi, Mumbai”"
              />
              <Button size="icon" className="h-10 w-11 rounded-lg" aria-label="Search talent">
                <ArrowRight className="size-5" />
              </Button>
            </form>
          </section>

          <section
            className="grid grid-cols-4 rounded-b-xl border border-t-0 border-border bg-card px-1 py-3 shadow-panel"
            aria-label="Quick actions"
          >
            {quickActions.map(({ label, icon: Icon, tone, href }) => (
              <Button
                key={label}
                variant="ghost"
                className="h-auto flex-col gap-1.5 whitespace-normal px-1 py-0 text-center text-[9px] font-bold leading-tight text-brand-ink"
                asChild
              >
                <Link href={href}>
                  <span className={`grid size-9 place-items-center rounded-full ${tone}`}>
                    <Icon className="size-4.5" />
                  </span>
                  {label}
                </Link>
              </Button>
            ))}
          </section>

          <section className="mt-4">
            <SectionTitle href="/recruiter/campaigns" chevron>
              Priority Tasks
            </SectionTitle>
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
              {tasks.map(({ title, project, due, urgent, href, icon: Icon, tone }) => (
                <Link
                  key={title}
                  href={href}
                  className="block w-[148px] shrink-0 rounded-lg border border-border bg-card p-2.5 shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between">
                    <span className={`grid size-8 place-items-center rounded-full ${tone}`}>
                      <Icon className="size-4" />
                    </span>
                    <ChevronRight className="mt-2 size-4 text-brand-ink" />
                  </div>
                  <h3 className="mt-2 min-h-8 text-[11px] font-extrabold leading-tight text-brand-ink">
                    {title}
                  </h3>
                  <p className="truncate text-[9px] text-muted-foreground">{project}</p>
                  <p
                    className={`mt-1 text-[9px] font-bold ${urgent ? "text-alert" : "text-muted-foreground"}`}
                  >
                    {due}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-4">
            <SectionTitle href="/recruiter/find-talent">Top AI Matches for You</SectionTitle>
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
              {loadingRecommendations ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-[192px] shrink-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                  >
                    <Skeleton className="h-28 w-full rounded-none" />
                    <div className="space-y-2 p-2.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-2.5 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))
              ) : talents.length === 0 ? (
                <div className="w-full rounded-lg border border-border bg-card p-5 text-center shadow-sm">
                  <p className="text-xs font-bold text-brand-ink">No recommendations yet</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {recommendations?.has_active_campaigns === false
                      ? "Create a campaign to get matched with talent."
                      : "Check back soon for fresh AI matches."}
                  </p>
                  <Button size="sm" className="mt-3 h-8 px-3 text-[11px] font-bold" asChild>
                    <Link href="/recruiter/campaigns/new">Create Campaign</Link>
                  </Button>
                </div>
              ) : (
                talents.map((talent, index) => {
                  const name = talent.full_legal_name || talent.username;
                  const profession = talent.professions?.slice(0, 2).join(" · ") || "Talent";
                  const location =
                    talent.location?.city || talent.location?.state || "India";
                  const tags = (talent.professions ?? []).slice(0, 3);
                  return (
                    <article
                      key={talent._id}
                      className="w-[192px] shrink-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                    >
                      <div className="relative h-28">
                        {talent.profile_photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={talent.profile_photo}
                            alt={`${name}, ${profession}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <StripImage
                            source={TALENT_STRIP}
                            crop={STRIP_CROPS[index % STRIP_CROPS.length]}
                            alt={`${name}, ${profession}`}
                          />
                        )}
                        <span className="absolute left-2 top-2 rounded-md bg-primary px-1.5 py-1 text-[10px] font-extrabold leading-none text-primary-foreground">
                          {talent.match_score}%
                          <br />
                          <span className="text-[8px]">Match</span>
                        </span>
                      </div>
                      <div className="p-2.5">
                        <h3 className="flex items-center gap-1 text-[12px] font-extrabold text-brand-ink">
                          <span className="truncate">{name}</span>
                          <span className="grid size-3.5 shrink-0 place-items-center rounded-full bg-info text-[8px] text-info-foreground">
                            <Check className="size-2.5" />
                          </span>
                        </h3>
                        <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
                          {profession}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[9px] text-muted-foreground">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">{location}</span>
                        </p>
                        {tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded bg-muted px-1.5 py-1 text-[8px] text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 grid grid-cols-2 gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-1 text-[9px] font-bold text-primary"
                            asChild
                          >
                            <Link href={`/talent/${talent.username}`}>View Profile</Link>
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 px-1 text-[9px] font-bold"
                            onClick={() => setShortlistTarget(talent)}
                          >
                            <Bookmark className="size-3" />
                            Shortlist
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="mt-4">
            <SectionTitle href="/recruiter/campaigns" chevron>
              Active Campaigns
            </SectionTitle>
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
              {loadingCampaigns ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex w-[205px] shrink-0 gap-2 rounded-lg border border-border bg-card p-2 shadow-sm"
                  >
                    <Skeleton className="h-[70px] w-12 shrink-0 rounded" />
                    <div className="min-w-0 flex-1 space-y-2 py-0.5">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2.5 w-1/2" />
                      <Skeleton className="h-1.5 w-full" />
                    </div>
                  </div>
                ))
              ) : campaigns.length === 0 ? (
                <div className="w-full rounded-lg border border-border bg-card p-5 text-center shadow-sm">
                  <p className="text-xs font-bold text-brand-ink">No active campaigns</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Create your first campaign to start receiving applications.
                  </p>
                  <Button size="sm" className="mt-3 h-8 px-3 text-[11px] font-bold" asChild>
                    <Link href="/recruiter/campaigns/new">Create Campaign</Link>
                  </Button>
                </div>
              ) : (
                campaigns.map((campaign, index) => {
                  const applications = campaign.applications_count ?? 0;
                  const progress =
                    maxCampaignApplications > 0
                      ? Math.round((applications / maxCampaignApplications) * 100)
                      : 0;
                  return (
                    <Link
                      key={campaign._id}
                      href={`/recruiter/campaigns/${campaign._id}`}
                      className="flex w-[205px] shrink-0 gap-2 rounded-lg border border-border bg-card p-2 shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                      <div className="h-[70px] w-12 shrink-0 overflow-hidden rounded">
                        {campaign.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={campaign.cover_image_url}
                            alt={`${campaign.name} campaign artwork`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <StripImage
                            source={CAMPAIGN_STRIP}
                            crop={STRIP_CROPS[index % STRIP_CROPS.length]}
                            alt={`${campaign.name} campaign artwork`}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <div className="flex justify-between gap-1">
                          <div className="min-w-0">
                            <h3 className="truncate text-[11px] font-extrabold text-brand-ink">
                              {campaign.name}
                            </h3>
                            <p className="truncate text-[9px] text-muted-foreground">
                              {campaign.role_type || "Casting"}
                            </p>
                          </div>
                          <ChevronRight className="size-4 shrink-0" />
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[9px] font-bold">
                          {applications}{" "}
                          <span className="font-normal text-muted-foreground">
                            application{applications === 1 ? "" : "s"}
                          </span>
                        </p>
                        <p className="truncate text-[8px] text-muted-foreground">
                          {deadlineLabel(campaign.deadline)}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>

          <section className="mt-4">
            <Link
              href="/recruiter/analytics"
              className="flex items-center gap-3 rounded-xl bg-copilot px-3 py-3 shadow-panel transition-transform hover:-translate-y-0.5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <Lightbulb className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-extrabold text-primary">Casting better, together.</h2>
                <p className="text-[10px] text-muted-foreground">
                  Great people don&apos;t just fill roles, they create bigger stories.
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-brand-ink" />
            </Link>
          </section>
        </div>
      </main>

      <ShortlistPicker
        talent={shortlistTarget}
        open={shortlistTarget !== null}
        onOpenChange={(open) => {
          if (!open) setShortlistTarget(null);
        }}
      />
    </div>
  );
}
