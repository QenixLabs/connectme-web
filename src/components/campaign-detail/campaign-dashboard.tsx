"use client";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  Bookmark,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock3,
  Eye,
  FileText,
  Home,
  IndianRupee,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Search,
  Send,
  Settings,
  Share2,
  Target,
  UserRoundCheck,
  UserSearch,
  Users,
  UsersRound,
  Video,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentType } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  useCampaign,
  useCampaignApplications,
  useCampaignInvites,
} from "@/hooks/use-campaigns";
import { CandidatesSection } from "@/components/campaign-detail/candidates-section";
import { CampaignTalentSection } from "@/components/campaign-detail/campaign-talent-section";
import { CampaignAuditionsSection } from "@/components/campaign-detail/campaign-auditions-section";
import { CampaignTeamSection } from "@/components/campaign-detail/campaign-team-section";
import { CampaignSettingsSection } from "@/components/campaign-detail/campaign-settings-section";
import type { CampaignInvite, EnrichedApplication } from "@/lib/api/campaigns";

type IconType = ComponentType<{ className?: string }>;

const tabs: Array<{ label: string; icon: IconType }> = [
  { label: "Overview", icon: Home },
  { label: "Candidates", icon: Users },
  { label: "Talent", icon: UserSearch },
  { label: "Auditions", icon: Video },
  { label: "Team", icon: UsersRound },
  { label: "Settings", icon: Settings },
];

function applicationName(application: EnrichedApplication): string {
  return (
    application.talent_profile?.full_legal_name ||
    application.talent_profile?.username ||
    (typeof application.talent_id === "object"
      ? application.talent_id.full_legal_name || application.talent_id.username
      : undefined) ||
    "Unknown talent"
  );
}

function shortRelative(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.max(
    0,
    Math.round((Date.now() - date.getTime()) / 1000),
  );
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

function initials(name?: string): string {
  return (name?.trim() || "Unknown")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function inviteName(invite: CampaignInvite): string {
  return typeof invite.talent_id === "object"
    ? invite.talent_id.full_legal_name || invite.talent_id.username || "Talent"
    : "Talent";
}

function daysRemaining(deadline?: string): number | null {
  if (!deadline) return null;
  const time = new Date(deadline).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.ceil((time - Date.now()) / (1000 * 60 * 60 * 24)));
}

function formatDay(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "d MMM yyyy");
}

function formatDayShort(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "d MMM");
}

function formatShootDates(start?: string, end?: string): string {
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;
  const validStart =
    startDate && !Number.isNaN(startDate.getTime()) ? startDate : null;
  const validEnd = endDate && !Number.isNaN(endDate.getTime()) ? endDate : null;
  if (validStart && validEnd) {
    return validStart.getFullYear() === validEnd.getFullYear()
      ? `${format(validStart, "d MMM")} – ${format(validEnd, "d MMM yyyy")}`
      : `${format(validStart, "d MMM yyyy")} – ${format(validEnd, "d MMM yyyy")}`;
  }
  if (validStart) return format(validStart, "d MMM yyyy");
  if (validEnd) return format(validEnd, "d MMM yyyy");
  return "Dates to be announced";
}

function formatBudget(min?: number, max?: number, currency?: string): string {
  if (min == null && max == null) return "Not disclosed";
  const code = currency ?? "INR";
  try {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    });
    if (min != null && max != null)
      return `${formatter.format(min)} – ${formatter.format(max)}`;
    return formatter.format((min ?? max) as number);
  } catch {
    if (min != null && max != null) return `${code} ${min} – ${max}`;
    return `${code} ${min ?? max}`;
  }
}

function formatLookingFor(
  gender?: string,
  min?: number,
  max?: number,
): string {
  const parts: string[] = [];
  if (gender) parts.push(gender.charAt(0).toUpperCase() + gender.slice(1));
  if (min != null || max != null)
    parts.push(`Age ${min ?? "?"}–${max ?? "?"}`);
  return parts.length > 0 ? parts.join(" · ") : "Open to all";
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action = "View all",
  onAction,
}: {
  icon: IconType;
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-2.5 flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-[14px] font-extrabold leading-tight text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="truncate text-[12px] leading-tight text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-1 text-[12px] font-bold text-primary hover:underline"
        >
          {action}
          <ChevronRight className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function BriefItem({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold leading-tight text-muted-foreground">
          {label}
        </p>
        <p className="break-words text-[13px] font-semibold leading-snug text-foreground" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function CampaignDashboard({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const {
    data: campaign,
    isLoading: campaignLoading,
    isError: campaignError,
  } = useCampaign(campaignId);
  const {
    data: applicationData,
    isLoading: applicationsLoading,
    isError: applicationsError,
  } = useCampaignApplications(campaignId);
  const { data: invites = [], isLoading: invitesLoading } =
    useCampaignInvites(campaignId);
  const [tab, setTab] = useState("Overview");
  const [notice, setNotice] = useState("");
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  if (campaignLoading || applicationsLoading || invitesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (campaignError || applicationsError || !campaign) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <h1 className="text-lg font-semibold">Unable to load this campaign</h1>
        <p className="text-sm text-muted-foreground">
          Check your connection and try opening the campaign again.
        </p>
      </div>
    );
  }

  const applications = applicationData?.data ?? [];
  const totalApplications =
    applicationData?.total ?? campaign.applications_count ?? 0;
  const pendingApplications = applicationData?.pending ?? 0;
  const shortlistedApplications = applicationData?.shortlisted ?? 0;
  const acceptedApplications = applicationData?.accepted ?? 0;
  const submittedTasks = applications.filter(
    (application) => application.task_submission_status === "submitted",
  ).length;
  const pendingInvites = invites.filter(
    (invite) => invite.status === "pending",
  ).length;

  const campaignLocation = [campaign.location?.city, campaign.location?.state]
    .filter(Boolean)
    .join(", ");
  const formattedDeadline = formatDay(campaign.deadline);
  const deadlineShort = formatDayShort(campaign.deadline);
  const remainingDays = daysRemaining(campaign.deadline);
  const category = campaign.industry || campaign.role_type || "Campaign";
  const statusLabel =
    campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1);
  const statusTone =
    campaign.status === "active"
      ? "bg-success-soft text-success"
      : campaign.status === "draft"
        ? "bg-warning-soft text-warning"
        : "bg-alert-soft text-alert";
  const statusDot =
    campaign.status === "active"
      ? "bg-success"
      : campaign.status === "draft"
        ? "bg-warning"
        : "bg-alert";

  const shootDates = formatShootDates(
    campaign.dates?.start,
    campaign.dates?.end,
  );
  const budget = formatBudget(
    campaign.budget_range?.min,
    campaign.budget_range?.max,
    campaign.budget_range?.currency,
  );
  const lookingFor = formatLookingFor(
    campaign.requirements?.gender,
    campaign.requirements?.age_range?.min,
    campaign.requirements?.age_range?.max,
  );
  const keyRequirements = [
    ...(campaign.requirements?.skills ?? []),
    ...(campaign.requirements?.languages ?? []),
  ].filter(Boolean);
  const deadlineDetail = formattedDeadline
    ? `${deadlineShort}${remainingDays != null ? ` · ${remainingDays} days left` : ""}`
    : "No deadline set";

  const recruiterName = campaign.recruiter?.company_name || "Campaign team";
  const recruiterVerified =
    campaign.recruiter?.verification_status === "verified";
  const recruiterLocation = [
    campaign.recruiter?.location?.city,
    campaign.recruiter?.location?.state,
  ]
    .filter(Boolean)
    .join(", ");
  const recruiterMeta =
    campaign.recruiter?.headline ??
    (recruiterLocation
      ? `Casting agency · ${recruiterLocation}`
      : "Casting agency");

  const healthMetrics: Array<{ label: string; value: string; icon: IconType; tone: string }> = [
    { label: "Applications", value: String(totalApplications), icon: Users, tone: "bg-primary-soft text-primary" },
    { label: "Shortlisted", value: String(shortlistedApplications), icon: Bookmark, tone: "bg-warning-soft text-warning" },
    { label: "Auditions", value: String(submittedTasks), icon: Video, tone: "bg-info-soft text-info" },
    { label: "Decisions", value: String(acceptedApplications), icon: CheckCircle2, tone: "bg-[var(--teal-soft)] text-[var(--teal)]" },
  ];

  const pipeline: Array<{ value: string; label: string; tone: string }> = [
    { value: String(totalApplications), label: "Applied", tone: "bg-primary-soft text-primary" },
    { value: String(pendingApplications), label: "Pending review", tone: "bg-warning-soft text-warning" },
    { value: String(shortlistedApplications), label: "Shortlisted", tone: "bg-success-soft text-success" },
    { value: String(submittedTasks), label: "Auditions", tone: "bg-info-soft text-info" },
    { value: String(acceptedApplications), label: "Decisions", tone: "bg-[var(--teal-soft)] text-[var(--teal)]" },
  ];

  const actions: Array<{
    title: string;
    subtitle: string;
    button: string;
    icon: IconType;
    tone: string;
    onOpen: () => void;
  }> = [];
  if (pendingApplications > 0) {
    actions.push({
      title: `${pendingApplications} applications waiting for review`,
      subtitle: "Review and move candidates forward",
      button: "Review",
      icon: Users,
      tone: "bg-warning-soft text-warning",
      onOpen: () => setTab("Candidates"),
    });
  }
  if (submittedTasks > 0) {
    actions.push({
      title: `${submittedTasks} audition submissions to review`,
      subtitle: "Watch and provide feedback",
      button: "Open",
      icon: Video,
      tone: "bg-info-soft text-info",
      onOpen: () => setTab("Auditions"),
    });
  }
  if (pendingInvites > 0) {
    actions.push({
      title: `${pendingInvites} pending invitations`,
      subtitle: "Follow up with invited talent",
      button: "View",
      icon: Mail,
      tone: "bg-primary-soft text-primary",
      onOpen: () => setTab("Talent"),
    });
  }

  const briefItems: Array<{ label: string; value: string; icon: IconType }> = [
    { label: "Role", value: campaign.role_type || category, icon: Briefcase },
    { label: "Shoot dates", value: shootDates, icon: CalendarDays },
    { label: "Location", value: campaignLocation || "Remote / flexible", icon: MapPin },
    { label: "Deadline", value: deadlineDetail, icon: Clock3 },
    { label: "Budget", value: budget, icon: IndianRupee },
    { label: "Looking for", value: lookingFor, icon: Search },
  ];

  const activities = [
    ...applications.map((application) => {
      const name = applicationName(application);
      const title =
        application.status === "accepted"
          ? `${name}'s application was accepted`
          : application.status === "rejected"
            ? `${name}'s application was rejected`
              : `${name} applied`;
      return {
        icon:
          application.status === "accepted"
            ? Check
            : application.status === "rejected"
              ? XCircle
              : Users,
        title,
        date: application.updated_at || application.created_at,
      };
    }),
    ...invites.map((invite) => ({
      icon: Send,
      title: `Invite sent to ${inviteName(invite)}`,
      date: invite.created_at,
    })),
    {
      icon: Clapperboard,
      title: "Campaign details updated",
      date: campaign.updated_at,
    },
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
  const visibleActivities = showAllActivity
    ? activities
    : activities.slice(0, 3);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Share link copied");
    } catch {
      notify("Unable to copy share link");
    }
  };

  return (
    <main className="campaign-detail-theme min-h-screen bg-canvas pb-24 font-sans text-foreground">
      <div className="mx-auto w-full max-w-[1160px] px-4 sm:px-6">
        <div className="pt-2.5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 rounded-full py-1 pr-2 text-[13px] font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Campaigns
          </button>
        </div>

        <section className="dashboard-hero mt-2">
          <div className="p-3.5 sm:p-4 lg:p-5">
            <div className="flex items-start gap-3">
              <div className="relative aspect-square w-[125px] shrink-0 overflow-hidden rounded-xl bg-muted sm:w-[150px] lg:w-[180px]">
                {campaign.cover_image_url ? (
                  <img
                    src={campaign.cover_image_url}
                    alt={`${campaign.name} campaign cover`}
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-primary/60">
                    <Clapperboard className="size-8" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="min-w-0 truncate rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-secondary-foreground">
                    {category}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusTone}`}
                  >
                    <span className={`size-1.5 rounded-full ${statusDot}`} />
                    {statusLabel}
                  </span>
                </div>

                <h1 className="mt-2 line-clamp-2 break-words font-display text-[17px] font-bold leading-tight tracking-tight text-foreground sm:text-lg">
                  {campaign.name}
                </h1>

                <div className="mt-2 space-y-1 text-[12px] leading-tight text-muted-foreground sm:text-[13px]">
                  <p className="flex min-w-0 items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0 text-primary" />
                    <span className="min-w-0 truncate">
                      {campaignLocation || "Remote / flexible"}
                    </span>
                  </p>
                  <p className="flex min-w-0 items-center gap-1.5">
                    <CalendarDays className="size-3.5 shrink-0 text-primary" />
                    <span className="min-w-0 truncate">{shootDates}</span>
                  </p>
                  <p className="flex min-w-0 items-center gap-1.5">
                    <Clock3 className="size-3.5 shrink-0 text-primary" />
                    <span className="min-w-0 truncate">
                      Deadline: {formattedDeadline || "No deadline"}
                    </span>
                  </p>
                  {remainingDays != null && (
                    <p className="pl-5 text-[11px] font-semibold text-primary">
                      {remainingDays} {remainingDays === 1 ? "day" : "days"} left
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-border/70 pt-2.5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-extrabold text-background">
                  CT
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="flex items-center gap-1 truncate text-[12.5px] font-bold">
                    Campaign team
                    {recruiterVerified && (
                      <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                    )}
                  </p>
                  <p className="truncate text-[11.5px] text-muted-foreground">
                    {recruiterName} · {recruiterMeta}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-[1fr_1.3fr_auto] gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 min-w-0 px-2 text-[12.5px]"
                onClick={() => notify("Preview opened")}
              >
                <Eye className="size-4" />
                Preview
              </Button>
              <Button size="sm" className="h-9 min-w-0 px-2 text-[12.5px]" asChild>
                <Link href={`/recruiter/campaigns/${campaignId}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0"
                aria-label="Share campaign"
                onClick={share}
              >
                <Share2 className="size-4" />
              </Button>
            </div>
          </div>
        </section>

        <nav
          className="sticky top-16 z-30 -mx-4 mt-2.5 border-b border-border bg-canvas/95 px-2 backdrop-blur sm:-mx-6 sm:px-4"
          aria-label="Campaign sections"
        >
          <div className="no-scrollbar flex gap-0.5 overflow-x-auto">
            {tabs.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setTab(label)}
                aria-current={tab === label ? "page" : undefined}
                className={`flex min-w-[76px] shrink-0 flex-col items-center gap-1 border-b-2 px-3 py-2.5 text-[11px] font-bold transition-colors ${
                  tab === label
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-5" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {tab === "Overview" && (
          <div className="grid gap-3 py-3 lg:grid-cols-5">
            <div className="space-y-3 lg:col-span-3">
              <section className="dashboard-section dashboard-section-compact">
                <SectionHeader
                  icon={BarChart3}
                  title="Campaign health"
                  subtitle="Key numbers at a glance"
                  action="View details"
                  onAction={() => setTab("Candidates")}
                />
                <div className="grid min-w-0 grid-cols-4 gap-1">
                  {healthMetrics.map(({ label, value, icon: Icon, tone }) => (
                    <div
                      key={label}
                      className="flex min-w-0 flex-col items-center rounded-xl border border-border/60 bg-muted/40 px-1 py-2 text-center"
                    >
                      <span className={`flex size-6 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                        <Icon className="size-3.5" />
                      </span>
                      <strong className="mt-1.5 font-display text-[17px] font-extrabold leading-none text-foreground">
                        {value}
                      </strong>
                      <span className="mt-1 w-full truncate text-[10px] font-semibold leading-tight tracking-tight text-muted-foreground">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="dashboard-section dashboard-section-compact">
                <SectionHeader
                  icon={Target}
                  title="Casting pipeline"
                  subtitle="From application to decision"
                  action="View all"
                  onAction={() => setTab("Candidates")}
                />
                <div className="grid min-w-0 grid-cols-5 items-stretch gap-1">
                  {pipeline.map((stage, index) => (
                    <div key={stage.label} className="relative min-w-0">
                      <div
                        className={`flex h-full min-w-0 flex-col items-center justify-center rounded-lg px-1 py-2 text-center ${stage.tone}`}
                      >
                        <div className="font-display text-[15px] font-extrabold leading-none">
                          {stage.value}
                        </div>
                        <div className="mt-1 break-words text-[9px] font-bold leading-tight">
                          {stage.label}
                        </div>
                      </div>
                      {index < pipeline.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute -right-[7px] top-1/2 z-10 flex size-3 -translate-y-1/2 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm"
                        >
                          <ChevronRight className="size-2.5" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="dashboard-section dashboard-section-compact">
                <SectionHeader
                  icon={Bell}
                  title="Action required"
                  subtitle="Items that need your attention"
                  action="View all"
                  onAction={() => setTab("Candidates")}
                />
                {actions.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-xl bg-success-soft px-3 py-2.5">
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                    <p className="text-[12.5px] font-semibold">
                      You&apos;re all caught up. Nothing needs review.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {actions.map(({ title, subtitle, button, icon: Icon, tone, onOpen }) => (
                      <li
                        key={title}
                        className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0"
                      >
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tone}`}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="truncate text-[13px] font-bold">
                            {title}
                          </p>
                          <p className="truncate text-[12px] text-muted-foreground">
                            {subtitle}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={onOpen}
                          className="h-7 shrink-0 px-2.5 text-[11px]"
                        >
                          {button}
                          <ArrowRight className="size-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="space-y-3 lg:col-span-2">
              <section className="dashboard-section dashboard-section-compact">
                <SectionHeader
                  icon={FileText}
                  title="Campaign brief"
                  subtitle="Key details at a glance"
                  action="View details"
                  onAction={() => setDetailsExpanded((value) => !value)}
                />
                <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-3">
                  {briefItems.map(({ label, value, icon: Icon }) => (
                    <BriefItem key={label} icon={Icon} label={label} value={value} />
                  ))}
                </div>
                <p className="mb-1.5 mt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Key requirements
                </p>
                {keyRequirements.length === 0 ? (
                  <p className="text-[12.5px] text-muted-foreground">
                    No specific requirements listed.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {(detailsExpanded
                      ? keyRequirements
                      : keyRequirements.slice(0, 4)
                    ).map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
                {detailsExpanded && campaign.description && (
                  <div className="mt-2.5 border-t border-border pt-2.5">
                    <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                      {campaign.description}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setDetailsExpanded((value) => !value)}
                  className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl bg-muted py-2 text-[12.5px] font-bold text-primary transition-colors hover:bg-secondary"
                >
                  {detailsExpanded
                    ? "Show less"
                    : "View full campaign details"}
                  <ChevronDown
                    className={`size-4 transition-transform ${detailsExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              </section>

              <section className="dashboard-section dashboard-section-compact">
                <SectionHeader
                  icon={Clock3}
                  title="Recent activity"
                  action={showAllActivity ? "Show less" : "View all"}
                  onAction={() => setShowAllActivity((value) => !value)}
                />
                {activities.length === 0 ? (
                  <p className="py-1.5 text-center text-[12.5px] text-muted-foreground">
                    No campaign activity yet.
                  </p>
                ) : (
                  <ul className="space-y-0.5">
                    {visibleActivities.map(({ icon: Icon, title, date }) => (
                      <li
                        key={`${title}-${date}`}
                        className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-muted"
                        title={title}
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                          <Icon className="size-3.5" />
                        </span>
                        <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">
                          {title}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {shortRelative(date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}

        {tab === "Candidates" && (
          <div className="py-3">
            <CandidatesSection campaignId={campaignId} />
          </div>
        )}

        {tab === "Talent" && (
          <div className="py-0">
            <CampaignTalentSection campaignId={campaignId} />
          </div>
        )}

        {tab === "Auditions" && (
          <div className="py-3">
            <CampaignAuditionsSection campaignId={campaignId} />
          </div>
        )}

        {tab === "Team" && (
          <div className="py-3">
            <CampaignTeamSection campaignId={campaignId} />
          </div>
        )}

        {tab === "Settings" && (
          <div className="py-3">
            <CampaignSettingsSection campaign={campaign} />
          </div>
        )}
      </div>

      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-4 shadow-nav backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1160px] items-center justify-between gap-4">
          <div className="hidden min-w-0 items-center gap-3 sm:flex">
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary-soft text-xs font-bold text-primary">
              {campaign.cover_image_url ? (
                <img
                  src={campaign.cover_image_url}
                  alt=""
                  className="aspect-square h-full w-full object-cover"
                />
              ) : (
                initials(campaign.name)
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 truncate font-bold">
                <span className="truncate">{campaign.name}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${statusTone}`}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="mt-0.5 text-[13px] text-muted-foreground">
                {remainingDays === null
                  ? "No deadline"
                  : `${remainingDays} days left`}
                &nbsp; • &nbsp;{totalApplications} applications
              </div>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => setTab("Candidates")}
            className="w-full sm:w-auto"
          >
            <UserRoundCheck className="size-5" />
            Review Applications
            <ArrowRight className="size-5" />
          </Button>
        </div>
      </aside>
      {notice && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow-nav"
        >
          {notice}
        </div>
      )}
    </main>
  );
}
