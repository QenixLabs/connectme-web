"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDashed,
  Clock3,
  FileText,
  Filter,
  Lightbulb,
  MapPin,
  MessageSquare,
  Star,
  Trophy,
  UserRoundCheck,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useRecruiterAnalytics,
  type AnalyticsRangeKey,
} from "@/hooks/use-recruiter-analytics";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PERIODS: Array<{ value: AnalyticsRangeKey; label: string }> = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "6m", label: "Last 6 months" },
  { value: "all", label: "All time" },
];

const FUNNEL_TONES = [
  "bg-primary",
  "bg-chart-3",
  "bg-chart-2",
  "bg-chart-1",
];

function Panel({
  icon,
  title,
  subtitle,
  children,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
      <header className="mb-4 flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-semibold leading-tight">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function Insight({
  icon,
  title,
  copy,
  tone,
}: {
  icon: ReactNode;
  title: string;
  copy: string;
  tone: string;
}) {
  return (
    <article className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 rounded-xl bg-muted/70 p-3">
      <div className={cn("grid size-9 place-items-center rounded-xl", tone)}>
        {icon}
      </div>
      <div>
        <h3 className="text-xs font-bold">{title}</h3>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          {copy}
        </p>
      </div>
    </article>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5">
      <Skeleton className="size-9 rounded-xl" />
      <Skeleton className="mt-3 h-3 w-20" />
      <Skeleton className="mt-2 h-7 w-14" />
      <Skeleton className="mt-2 h-3 w-full" />
    </div>
  );
}

function FilterMenu({
  icon: Icon,
  ariaLabel,
  label,
  options,
  value,
  onSelect,
}: {
  icon: LucideIcon;
  ariaLabel: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold outline-none transition-colors hover:border-border-hover focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-primary/50"
        >
          <Icon className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] min-w-44 overflow-auto"
      >
        {options.map((o) => (
          <DropdownMenuItem
            key={o.value || "__all"}
            onSelect={() => onSelect(o.value)}
            className="text-xs font-semibold"
          >
            <span className="min-w-0 flex-1 truncate">{o.label}</span>
            {value === o.value && <Check className="size-4 shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AnalyticsClient() {
  const [period, setPeriod] = useState<AnalyticsRangeKey>("90d");
  const [roleType, setRoleType] = useState("");
  const analytics = useRecruiterAnalytics(period, roleType);
  const {
    totals,
    funnel,
    trend,
    bestCampaigns,
    avgTimeToHireDays,
    avgTimeToDecisionDays,
    locations,
    professions,
    gender,
    statusBreakdown,
    roleTypes,
    isLoading,
    isError,
  } = analytics;

  const periodLabel =
    PERIODS.find((p) => p.value === period)?.label ?? "Last 90 days";

  const kpis = useMemo(() => {
    const base = Math.max(totals.applications, 1);
    const conv = (n: number) => `${Math.round((n / base) * 100)}% of applied`;
    return [
      {
        label: "Applications",
        value: totals.applications,
        sub: `Across ${totals.campaigns} campaigns`,
        icon: FileText,
        tone: "icon-teal",
      },
      {
        label: "Shortlisted",
        value: totals.shortlisted,
        sub: conv(totals.shortlisted),
        icon: Star,
        tone: "icon-amber",
      },
      {
        label: "Hired",
        value: totals.hired,
        sub: conv(totals.hired),
        icon: UserRoundCheck,
        tone: "icon-violet",
      },
      {
        label: "Active Campaigns",
        value: totals.activeCampaigns,
        sub: `Of ${totals.campaigns} total`,
        icon: BriefcaseBusiness,
        tone: "icon-teal",
      },
      {
        label: "Invites Sent",
        value: totals.invites,
        sub: `${Math.round(totals.responseRate * 100)}% responded`,
        icon: MessageSquare,
        tone: "icon-violet",
      },
      {
        label: "Pending Review",
        value: totals.pending,
        sub: conv(totals.pending),
        icon: Clock3,
        tone: "icon-red",
      },
    ];
  }, [totals]);

  const maxTrend = Math.max(
    4,
    ...trend.map((t) => Math.max(t.applications, t.hired)),
  );

  const statusData = useMemo(() => {
    const total = Math.max(
      statusBreakdown.pending +
        statusBreakdown.accepted +
        statusBreakdown.rejected,
      1,
    );
    return [
      {
        label: "Pending",
        value: statusBreakdown.pending,
        pct: Math.round((statusBreakdown.pending / total) * 100),
        color: "var(--chart-1)",
      },
      {
        label: "Hired",
        value: statusBreakdown.accepted,
        pct: Math.round((statusBreakdown.accepted / total) * 100),
        color: "var(--chart-2)",
      },
      {
        label: "Rejected",
        value: statusBreakdown.rejected,
        pct: Math.round((statusBreakdown.rejected / total) * 100),
        color: "var(--destructive)",
      },
    ];
  }, [statusBreakdown]);

  const genderEntries = useMemo(
    () =>
      Object.entries(gender)
        .map(([label, value]) => ({
          label: label.charAt(0).toUpperCase() + label.slice(1),
          value,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4),
    [gender],
  );

  const insights = useMemo(() => {
    const list: Array<{ title: string; copy: string }> = [];
    if (bestCampaigns.length > 0 && totals.applications > 0) {
      const top = [...bestCampaigns].sort(
        (a, b) => b.conversion - a.conversion,
      )[0];
      if (top && top.applications > 0) {
        list.push({
          title: `“${top.name}” converts best`,
          copy: `${top.conversion.toFixed(1)}% hire rate across ${top.applications} applications. Reuse its brief and requirements for similar roles.`,
        });
      }
    }
    if (locations.length > 0) {
      const top = locations[0];
      list.push({
        title: `${top.city} leads applications`,
        copy: `${top.count} applicants (${top.pct}%) come from ${top.city}. Consider targeted campaigns or local auditions there.`,
      });
    }
    if (totals.pending > totals.hired && totals.pending > 0) {
      list.push({
        title: "Clear the review backlog",
        copy: `${totals.pending} applications are waiting while ${totals.hired} have been hired. Streamlining shortlisting cuts time-to-hire.`,
      });
    } else if (totals.hired > 0) {
      list.push({
        title: "Pipeline is moving",
        copy: `${totals.hired} hires from ${totals.applications} applications. Keep shortlisting to sustain the conversion rate.`,
      });
    }
    if (totals.invites > 0 && totals.responseRate < 0.5) {
      list.push({
        title: "Boost invite responses",
        copy: `Only ${Math.round(totals.responseRate * 100)}% of ${totals.invites} invites got a reply. Personalised messages lift acceptance.`,
      });
    }
    if (professions.length > 0) {
      list.push({
        title: `${professions[0].name} dominates`,
        copy: `${professions[0].count} applicants list ${professions[0].name} as their profession — align role requirements accordingly.`,
      });
    }
    return list.slice(0, 3);
  }, [bestCampaigns, locations, professions, totals]);

  const hasData = totals.applications > 0 || totals.campaigns > 0;

  return (
    <div className="min-h-full bg-background px-4 pb-28 pt-4 sm:px-6 lg:px-8">
      <main className="mx-auto w-full max-w-[1320px]">
        {/* Header */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Analytics
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Recruitment Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live pipeline, hiring trends and talent mix — aggregated from your
            campaigns.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FilterMenu
              icon={CalendarDays}
              ariaLabel="Time period"
              label={periodLabel}
              value={period}
              onSelect={(v) => setPeriod(v as AnalyticsRangeKey)}
              options={PERIODS.map((p) => ({ value: p.value, label: p.label }))}
            />
            <FilterMenu
              icon={Filter}
              ariaLabel="Campaign type"
              label={roleType || "All Campaigns"}
              value={roleType}
              onSelect={setRoleType}
              options={[
                { value: "", label: "All Campaigns" },
                ...roleTypes.map((t) => ({ value: t, label: t })),
              ]}
            />
          </div>
        </section>

        {isError ? (
          <div className="mt-4 rounded-2xl border border-destructive/40 bg-card px-6 py-14 text-center">
            <CircleDashed className="mx-auto size-9 text-destructive" />
            <h2 className="mt-3 font-display font-semibold">
              Unable to load analytics
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Check your connection and try again.
            </p>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <section
              aria-label="Key performance indicators"
              className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6"
            >
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <KpiSkeleton key={i} />
                  ))
                : kpis.map(({ label, value, sub, icon: Icon, tone }) => (
                    <article
                      key={label}
                      className="rounded-2xl border border-border bg-card p-3.5 shadow-card"
                    >
                      <div
                        className={cn(
                          "mb-3 grid size-9 place-items-center rounded-xl",
                          tone,
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <p className="truncate text-[11px] font-semibold text-muted-foreground">
                        {label}
                      </p>
                      <strong className="mt-1 block text-2xl leading-none">
                        {value.toLocaleString("en-IN")}
                      </strong>
                      <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
                        {sub}
                      </p>
                    </article>
                  ))}
            </section>

            {!isLoading && !hasData ? (
              <div className="mt-4 rounded-2xl border border-border bg-card px-6 py-14 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <BarChart3 className="size-6" />
                </span>
                <h2 className="mt-3 font-display text-[15px] font-semibold">
                  No analytics yet
                </h2>
                <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
                  Create a campaign and start receiving applications — your
                  funnel, trends and talent mix will appear here.
                </p>
                <Link
                  href="/recruiter/campaigns/new"
                  className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
                >
                  Create Campaign
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {/* Funnel */}
                  <Panel
                    icon={<Filter className="size-4" />}
                    title="Recruitment Funnel"
                    subtitle={`Application to hire · ${periodLabel}`}
                  >
                    {isLoading ? (
                      <div className="space-y-2.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {funnel.map((stage, i) => (
                          <div
                            key={stage.label}
                            className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-3"
                          >
                            <div className="flex justify-center">
                              <div
                                className={cn(
                                  "rounded-lg py-2 text-center text-xs font-extrabold text-primary-foreground",
                                  FUNNEL_TONES[i % FUNNEL_TONES.length],
                                )}
                                style={{
                                  width: `${Math.max(stage.pct, stage.value > 0 ? 18 : 100)}%`,
                                  opacity: 1 - i * 0.12,
                                }}
                              >
                                {stage.value.toLocaleString("en-IN")}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-[11px] font-semibold">
                                {stage.label}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {stage.pct}% of applications
                              </div>
                            </div>
                          </div>
                        ))}
                        <p className="pt-1 text-[10px] text-muted-foreground">
                          Audition and interview rounds aren&apos;t tracked as
                          separate stages by the backend, so the funnel reflects
                          the real application lifecycle.
                        </p>
                      </div>
                    )}
                  </Panel>

                  {/* Hiring trend */}
                  <Panel
                    icon={<BarChart3 className="size-4" />}
                    title="Hiring Trend"
                    subtitle={`Applications vs hires · ${periodLabel}`}
                  >
                    {isLoading ? (
                      <Skeleton className="h-[248px] w-full rounded-xl" />
                    ) : (
                      <>
                        <div className="mb-2 flex justify-end gap-1.5">
                          <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                            Applications
                          </span>
                          <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">
                            Hired
                          </span>
                        </div>
                        <div className="h-[220px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={trend}
                              margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
                            >
                              <defs>
                                <linearGradient
                                  id="analyticsApps"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="var(--primary)"
                                    stopOpacity={0.35}
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="var(--primary)"
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                              <CartesianGrid
                                stroke="var(--border)"
                                strokeDasharray="4 4"
                              />
                              <XAxis
                                dataKey="label"
                                tick={{
                                  fill: "var(--muted-foreground)",
                                  fontSize: 11,
                                }}
                                tickLine={false}
                                axisLine={{ stroke: "var(--border)" }}
                              />
                              <YAxis
                                domain={[0, maxTrend]}
                                allowDecimals={false}
                                tick={{
                                  fill: "var(--muted-foreground)",
                                  fontSize: 11,
                                }}
                                tickLine={false}
                                axisLine={{ stroke: "var(--border)" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: "var(--popover)",
                                  border: "1px solid var(--border)",
                                  borderRadius: 10,
                                  color: "var(--popover-foreground)",
                                  fontSize: 12,
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="applications"
                                name="Applications"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                fill="url(#analyticsApps)"
                                dot={false}
                                activeDot={{ r: 4 }}
                              />
                              <Area
                                type="monotone"
                                dataKey="hired"
                                name="Hired"
                                stroke="var(--chart-2)"
                                strokeWidth={2}
                                fill="transparent"
                                strokeDasharray="5 3"
                                dot={false}
                                activeDot={{ r: 4 }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Applications are bucketed live from per-campaign
                          analytics; hires are derived from
                          accepted-application timestamps.
                        </p>
                      </>
                    )}
                  </Panel>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                  {/* Best campaigns */}
                  <Panel
                    icon={<Trophy className="size-4" />}
                    title="Best Performing Campaigns"
                    subtitle="Ranked by hires, then applications"
                    action={
                      <Link
                        href="/recruiter/campaigns"
                        className="shrink-0 pt-0.5 text-xs font-semibold text-primary hover:underline"
                      >
                        View all
                      </Link>
                    }
                  >
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-14 w-full" />
                        ))}
                      </div>
                    ) : bestCampaigns.length === 0 ? (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        No campaigns to rank yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {bestCampaigns.map((c, i) => (
                          <Link
                            key={c.id}
                            href={`/recruiter/campaigns/${c.id}`}
                            className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-muted/60 p-2.5 transition-colors hover:bg-muted"
                          >
                            <span className="text-center text-xs font-bold text-muted-foreground">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <h3 className="truncate text-xs font-bold">
                                {c.name}
                              </h3>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {c.roleType ?? "Campaign"} ·{" "}
                                {c.applications.toLocaleString("en-IN")}{" "}
                                applied · {c.shortlisted} shortlisted
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end gap-0.5 text-xs font-extrabold text-success">
                                <ArrowUpRight className="size-3" />
                                {c.conversion.toFixed(1)}%
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {c.hired} hired
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </Panel>

                  {/* Time to hire */}
                  <Panel
                    icon={<Clock3 className="size-4" />}
                    title="Average Time to Hire"
                    subtitle="Application to decision, from live timestamps"
                  >
                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-36 w-full" />
                      </div>
                    ) : avgTimeToHireDays === null ? (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        Hire your first applicant to unlock time-to-hire stats.
                      </p>
                    ) : (
                      <>
                        <div className="mb-1 flex items-end gap-2">
                          <strong className="text-3xl font-extrabold">
                            {avgTimeToHireDays}{" "}
                            <span className="text-base font-bold">Days</span>
                          </strong>
                        </div>
                        <p className="mb-5 text-[11px] text-muted-foreground">
                          {avgTimeToDecisionDays !== null
                            ? `Avg. ${avgTimeToDecisionDays} days to any decision (hire / reject).`
                            : "Measured from application to hire."}
                        </p>
                        <div className="flex h-36 items-end justify-around gap-4 border-b border-border px-4">
                          {[
                            {
                              label: "To hire",
                              days: avgTimeToHireDays,
                              tone: "bg-primary",
                            },
                            {
                              label: "To decision",
                              days: avgTimeToDecisionDays ?? avgTimeToHireDays,
                              tone: "bg-primary/40",
                            },
                          ].map((bar) => {
                            const max = Math.max(
                              avgTimeToHireDays,
                              avgTimeToDecisionDays ?? 0,
                              1,
                            );
                            return (
                              <div
                                key={bar.label}
                                className="flex h-full flex-1 flex-col items-center justify-end"
                              >
                                <span className="mb-1 text-[10px] font-bold">
                                  {bar.days}d
                                </span>
                                <div
                                  className={cn(
                                    "w-full max-w-14 rounded-t-md",
                                    bar.tone,
                                  )}
                                  style={{
                                    height: `${Math.max((bar.days / max) * 100, 8)}%`,
                                  }}
                                />
                                <span className="mt-2 text-center text-[10px] text-muted-foreground">
                                  {bar.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </Panel>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Status breakdown */}
                  <Panel
                    icon={<BarChart3 className="size-4" />}
                    title="Application Status"
                    subtitle="Live split across analysed campaigns"
                  >
                    {isLoading ? (
                      <Skeleton className="h-44 w-full rounded-xl" />
                    ) : (
                      <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                        <div className="space-y-2.5">
                          {statusData.map((s) => (
                            <div
                              key={s.label}
                              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-[11px]"
                            >
                              <span
                                className="size-2.5 rounded-full"
                                style={{ background: s.color }}
                              />
                              <span className="truncate">{s.label}</span>
                              <b>
                                {s.value} ({s.pct}%)
                              </b>
                            </div>
                          ))}
                          {genderEntries.length > 0 && (
                            <div className="border-t border-border pt-2.5">
                              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Gender mix
                              </p>
                              {genderEntries.map((g) => (
                                <div
                                  key={g.label}
                                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 py-0.5 text-[11px]"
                                >
                                  <span className="size-2 rounded-full bg-muted-foreground/50" />
                                  <span className="truncate">{g.label}</span>
                                  <b>{g.value}</b>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="h-[150px] w-[130px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusData}
                                dataKey="value"
                                innerRadius={42}
                                outerRadius={62}
                                paddingAngle={2}
                                stroke="none"
                              >
                                {statusData.map((s) => (
                                  <Cell key={s.label} fill={s.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  background: "var(--popover)",
                                  border: "1px solid var(--border)",
                                  borderRadius: 10,
                                  fontSize: 12,
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    {!isLoading && professions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                        {professions.slice(0, 5).map((p) => (
                          <span
                            key={p.name}
                            className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-secondary-foreground"
                          >
                            {p.name} · {p.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </Panel>

                  {/* Locations */}
                  <Panel
                    icon={<MapPin className="size-4" />}
                    title="Top Talent Locations"
                    subtitle="Applicant cities from live demographics"
                  >
                    {isLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} className="h-4 w-full" />
                        ))}
                      </div>
                    ) : locations.length === 0 ? (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        Location data appears once talents apply.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {locations.map((loc) => (
                          <div
                            key={loc.city}
                            className="grid grid-cols-[72px_minmax(0,1fr)_36px] items-center gap-2 text-[11px]"
                          >
                            <span className="truncate">{loc.city}</span>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary/70"
                                style={{ width: `${Math.max(loc.pct, 4)}%` }}
                              />
                            </div>
                            <b className="text-right">{loc.pct}%</b>
                          </div>
                        ))}
                      </div>
                    )}
                  </Panel>

                  {/* Insights */}
                  <Panel
                    icon={<Lightbulb className="size-4" />}
                    title="Insights & Recommendations"
                    subtitle="Computed from your live data"
                  >
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : insights.length === 0 ? (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        Insights unlock as applications arrive.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {insights.map((insight, i) => (
                          <Insight
                            key={insight.title}
                            icon={
                              i === 0 ? (
                                <ArrowUpRight className="size-4" />
                              ) : i === 1 ? (
                                <UsersRound className="size-4" />
                              ) : (
                                <Zap className="size-4" />
                              )
                            }
                            title={insight.title}
                            copy={insight.copy}
                            tone={
                              i === 0
                                ? "bg-success-soft text-success"
                                : i === 1
                                  ? "bg-primary-soft text-primary"
                                  : "bg-muted text-warning"
                            }
                          />
                        ))}
                      </div>
                    )}
                  </Panel>
                </div>

                <Card className="mt-4 gap-0 rounded-2xl p-4 text-[11px] leading-relaxed text-muted-foreground">
                  <p>
                    Aggregated live from your{" "}
                    {roleType ? `${roleType} ` : ""}active and closed campaigns
                    (up to 12 most recent){roleType ? "" : ""} ·{" "}
                    {periodLabel.toLowerCase()} window applies to the hiring
                    trend. Talent discovery counts, audition / interview splits
                    and traffic-source attribution don&apos;t exist in the
                    backend, so they&apos;re intentionally omitted instead of
                    mocked.
                  </p>
                </Card>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
