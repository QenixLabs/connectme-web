"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  Globe2,
  Lightbulb,
  MapPin,
  Megaphone,
  PlaySquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMyProfile } from "@/hooks/use-talent-profile";
import { talentApi, type TalentAnalytics, type TalentAnalyticsRange } from "@/lib/api/talent";
import { cn } from "@/lib/utils";

const ranges: Array<{ value: TalentAnalyticsRange; label: string }> = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "3m", label: "3 Months" },
  { value: "1y", label: "1 Year" },
];

const metricIcons: Record<string, typeof Eye> = {
  profile_views: Eye,
  recruiter_views: Users,
  applications: FileText,
  accepted: CheckCircle2,
  auditions: PlaySquare,
  invitations: Megaphone,
};

function initials(value: string) {
  return value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatMetric(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDate(value: string) {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StateCard({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-[28px] border border-[#e8e4f4] bg-white p-6 text-center shadow-[0_16px_45px_rgba(64,44,128,0.06)]">
      <Activity className="mx-auto mb-3 size-7 text-[#7c3aed]" />
      <h2 className="font-semibold text-[#17153d]">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-[#777493]">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#6d28d9] px-4 py-2 text-sm font-medium text-white">
          <RefreshCw className="size-4" /> Retry
        </button>
      )}
    </div>
  );
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-[28px] border border-[#e8e4f4] bg-white p-4 shadow-[0_16px_45px_rgba(64,44,128,0.06)] sm:p-6", className)}>{children}</section>;
}

function SectionHeading({ icon: Icon, title, action }: { icon: typeof Eye; title: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-2xl bg-[#f0e8ff] text-[#6d28d9]"><Icon className="size-5" /></span><h2 className="font-display text-lg font-bold tracking-tight text-[#17153d]">{title}</h2></div>{action}</div>;
}

function TrendChange({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-[#9691ad]">No prior period</span>;
  const positive = value >= 0;
  return <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", positive ? "text-[#129b59]" : "text-[#d34a62]")}>{positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}{Math.abs(value)}%</span>;
}

function MetricCard({ metric, series }: { metric: TalentAnalytics["metrics"][number]; series: TalentAnalytics["series"] }) {
  const Icon = metricIcons[metric.key] ?? BarChart3;
  const chartData = series.map((point) => ({ date: point.date, value: metric.key === "recruiter_views" ? point.recruiter_views : metric.key === "profile_views" ? point.profile_views : 0 }));
  const hasSeries = chartData.some((point) => point.value > 0);
  return <div className="min-w-0 rounded-[22px] border border-[#eeeaf8] bg-[#fcfbff] p-3.5 sm:p-4"><div className="grid size-9 place-items-center rounded-full bg-[#f0e8ff] text-[#7c3aed]"><Icon className="size-5" /></div><p className="mt-3 truncate text-xs text-[#777493]">{metric.label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-[#17153d]">{formatMetric(metric.current)}</p><div className="mt-1"><TrendChange value={metric.changePercent} /></div>{hasSeries && <div className="-mx-1 mt-2 h-8"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id={`metric-${metric.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs><Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} fill={`url(#metric-${metric.key})`} dot={false} /></AreaChart></ResponsiveContainer></div>}</div>;
}

function MainChart({ data, selected, onSelected }: { data: TalentAnalytics["series"]; selected: "profile_views" | "recruiter_views"; onSelected: (value: "profile_views" | "recruiter_views") => void }) {
  const chartData = data.map((point) => ({ ...point, label: formatDate(point.date) }));
  const hasRecruiterData = data.some((point) => point.recruiter_views > 0);
  return <SectionCard><SectionHeading icon={Eye} title="Profile reach trend" action={<label className="relative"><span className="sr-only">Trend dataset</span><select value={selected} onChange={(event) => onSelected(event.target.value as typeof selected)} className="appearance-none rounded-xl border border-[#e5ddf7] bg-white py-2 pl-3 pr-8 text-xs font-medium text-[#30245e] outline-none"><option value="profile_views">Profile Views</option>{hasRecruiterData && <option value="recruiter_views">Recruiter Views</option>}</select><ChevronDown className="pointer-events-none absolute right-2 top-2.5 size-4 text-[#7c3aed]" /></label>}/>{chartData.length === 0 ? <StateCard title="No historical trend yet" message="A trend will appear after profile activity is recorded." /> : <div className="h-[230px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}><defs><linearGradient id="reach-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="#eeeaf8" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8b86a4" }} tickLine={false} axisLine={false} minTickGap={28} /><YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#8b86a4" }} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e5ddf7", boxShadow: "0 10px 30px rgba(64,44,128,.12)" }} /><Area type="monotone" dataKey={selected} stroke="#7c3aed" strokeWidth={3} fill="url(#reach-fill)" connectNulls dot={{ r: 3, fill: "#7c3aed", strokeWidth: 0 }} /></AreaChart></ResponsiveContainer></div>}</SectionCard>;
}

function OutcomeCard({ analytics }: { analytics: TalentAnalytics }) {
  const total = analytics.outcomes.reduce((sum, item) => sum + item.count, 0);
  return <SectionCard><SectionHeading icon={CheckCircle2} title="Application outcomes" action={<Link href="/talent/applications" className="text-sm font-semibold text-[#6d28d9]">View applications</Link>} />{analytics.outcomes.length === 0 ? <p className="rounded-2xl bg-[#faf8ff] p-5 text-sm text-[#777493]">Your application outcomes will appear after you apply to an opportunity.</p> : <div className="space-y-4">{analytics.outcomes.map((outcome) => <div key={outcome.status}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="capitalize text-[#403b63]">{humanize(outcome.status)}</span><span className="font-semibold text-[#17153d]">{outcome.count} <span className="font-normal text-[#9691ad]">({outcome.percentage}%)</span></span></div><div className="h-2 overflow-hidden rounded-full bg-[#eeeaf8]"><div className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#b06cff]" style={{ width: `${total ? outcome.percentage : 0}%` }} /></div></div>)}</div>}</SectionCard>;
}

export function TalentAnalyticsPage() {
  const [range, setRange] = useState<TalentAnalyticsRange>("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dataset, setDataset] = useState<"profile_views" | "recruiter_views">("profile_views");
  const [locationTab, setLocationTab] = useState<"cities" | "countries">("cities");
  const profileQuery = useMyProfile();
  const analyticsQuery = useQuery({
    queryKey: ["talent-analytics", range, from, to],
    queryFn: () => talentApi.getMyAnalytics({ range, ...(from ? { from } : {}), ...(to ? { to } : {}) }),
  });
  const profile = profileQuery.data;
  const analytics = analyticsQuery.data;
  const displayName = profile?.professional_name || profile?.full_legal_name || profile?.username || "Your profile";
  const hasAnyActivity = Boolean(analytics && analytics.metrics.some((metric) => metric.current > 0));

  if (profileQuery.isLoading || analyticsQuery.isLoading) return <main className="min-h-screen bg-[#f8f7ff] px-4 py-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-32 rounded-[28px] bg-white" /><div className="grid grid-cols-2 gap-3 lg:grid-cols-3"><div className="h-36 rounded-[22px] bg-white" /><div className="h-36 rounded-[22px] bg-white" /><div className="h-36 rounded-[22px] bg-white" /></div><div className="h-72 rounded-[28px] bg-white" /></div></main>;
  if (profileQuery.isError || analyticsQuery.isError || !profile || !analytics) return <main className="min-h-screen bg-[#f8f7ff] px-4 py-8"><div className="mx-auto max-w-lg"><StateCard title="Analytics could not load" message="We could not retrieve your analytics right now. Your profile and applications are unchanged." onRetry={() => { void profileQuery.refetch(); void analyticsQuery.refetch(); }} /></div></main>;

  const hasLocationTabs = analytics.locations.length > 0 && analytics.countries.length > 0;
  const locations = hasLocationTabs
    ? locationTab === "cities" ? analytics.locations : analytics.countries
    : analytics.locations.length > 0 ? analytics.locations : analytics.countries;
  const hasRecruiterTrend = analytics.series.some((point) => point.recruiter_views > 0);
  const activeDataset = dataset === "recruiter_views" && hasRecruiterTrend ? dataset : "profile_views";
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#eee7ff_0%,#f8f7ff_38%,#f8f7ff_100%)] px-4 pb-28 pt-4 text-[#17153d] sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-5 lg:space-y-6">
    <section className="relative overflow-hidden rounded-[30px] border border-[#e8e4f4] bg-white p-5 shadow-[0_16px_45px_rgba(64,44,128,0.06)] sm:p-7"><div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-[#eadcff] blur-3xl" /><div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><Avatar className="size-16 border-4 border-[#f0e8ff] sm:size-20"><AvatarImage src={profile.profile_photo} alt={`${displayName} profile photo`} /><AvatarFallback className="bg-[#ede9fe] font-bold text-[#6d28d9]">{initials(displayName)}</AvatarFallback></Avatar><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{displayName}</h1>{profile.is_verified && <ShieldCheck className="size-5 text-[#7c3aed]" aria-label="Verified profile" />}</div><p className="mt-1 text-sm text-[#5d587d]">{profile.professions?.join(" · ") || profile.headline || "Talent profile"}</p><p className="mt-1 flex items-center gap-1.5 text-sm text-[#777493]"><MapPin className="size-4 text-[#7c3aed]" />{[profile.location?.city, profile.location?.state, profile.location?.country].filter(Boolean).join(", ") || "Location not added"}</p></div></div><div className="flex flex-col gap-2 sm:items-end"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9691ad]">Performance window</p><div className="flex rounded-2xl border border-[#e5ddf7] bg-[#faf8ff] p-1">{ranges.map((item) => <button key={item.value} type="button" onClick={() => setRange(item.value)} className={cn("rounded-xl px-2.5 py-2 text-xs font-medium transition sm:px-3", range === item.value ? "bg-[#6d28d9] text-white shadow-sm" : "text-[#5d587d] hover:bg-white")}>{item.label}</button>)}</div><div className="flex items-center gap-2"><CalendarDays className="size-4 text-[#7c3aed]" /><input aria-label="From date" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="min-w-0 rounded-xl border border-[#e5ddf7] bg-white px-2 py-1.5 text-xs text-[#403b63]" /><span className="text-xs text-[#9691ad]">to</span><input aria-label="To date" type="date" value={to} onChange={(event) => setTo(event.target.value)} className="min-w-0 rounded-xl border border-[#e5ddf7] bg-white px-2 py-1.5 text-xs text-[#403b63]" /></div></div></div></section>
    {!hasAnyActivity && <StateCard title="Your analytics are just getting started" message="Analytics will appear here after recruiters discover your profile or you apply to opportunities." />}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">{analytics.metrics.map((metric) => <MetricCard key={metric.key} metric={metric} series={analytics.series} />)}</div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]"><MainChart data={analytics.series} selected={activeDataset} onSelected={setDataset} /><SectionCard><SectionHeading icon={Sparkles} title="Insights" />{analytics.insights.length === 0 ? <p className="rounded-2xl bg-[#faf8ff] p-5 text-sm text-[#777493]">Insights will appear when there is enough activity to compare.</p> : <div className="space-y-4">{analytics.insights.map((insight, index) => <div key={`${insight.type}-${index}`} className="flex gap-3 border-b border-[#f0edf8] pb-4 last:border-0 last:pb-0"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-[#f0e8ff] text-[#7c3aed]"><Lightbulb className="size-4" /></span><p className="text-sm leading-6 text-[#403b63]">{insight.text}</p></div>)}</div>}</SectionCard></div>
    <div className="grid gap-5 lg:grid-cols-2"><SectionCard><SectionHeading icon={MapPin} title="Top locations" action={hasLocationTabs && <div className="flex rounded-xl bg-[#faf8ff] p-1">{(["cities", "countries"] as const).map((tab) => <button type="button" key={tab} onClick={() => setLocationTab(tab)} className={cn("rounded-lg px-2.5 py-1 text-xs", locationTab === tab ? "bg-white font-semibold text-[#6d28d9] shadow-sm" : "text-[#777493]")}>{tab === "cities" ? "Cities" : "Countries"}</button>)}</div>}/>{locations.length === 0 ? <p className="rounded-2xl bg-[#faf8ff] p-5 text-sm text-[#777493]">Location data will appear when a viewer&apos;s location is available.</p> : <div className="space-y-4">{locations.map((location) => <div key={location.name}><div className="mb-1.5 flex justify-between text-sm"><span className="text-[#403b63]">{location.name}</span><span className="font-semibold text-[#17153d]">{location.percentage}%</span></div><div className="h-2 rounded-full bg-[#eeeaf8]"><div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${location.percentage}%` }} /></div></div>)}</div>}</SectionCard><OutcomeCard analytics={analytics} /></div>
    <div className="grid gap-5 lg:grid-cols-2"><SectionCard><SectionHeading icon={BriefcaseBusiness} title="Opportunities by category" action={<Link href="/talent/applications" className="text-sm font-semibold text-[#6d28d9]">View all</Link>} />{analytics.categories.length === 0 ? <p className="rounded-2xl bg-[#faf8ff] p-5 text-sm text-[#777493]">Categories will appear after you submit applications.</p> : <div className="grid gap-3 sm:grid-cols-2">{analytics.categories.map((category) => <Link key={category.category} href="/talent/applications" className="flex items-center justify-between rounded-2xl border border-[#eeeaf8] p-4 transition hover:border-[#c4a8f5] hover:bg-[#fcfbff]"><span className="text-sm text-[#403b63]">{category.category}</span><span className="font-bold text-[#6d28d9]">{category.count}</span></Link>)}</div>}</SectionCard><SectionCard><SectionHeading icon={Users} title="Recent recruiter activity" />{analytics.viewers.length === 0 ? <p className="rounded-2xl bg-[#faf8ff] p-5 text-sm text-[#777493]">Recruiter identities will appear here when available under your privacy settings.</p> : <div className="space-y-3">{analytics.viewers.map((viewer) => <div key={`${viewer.id}-${viewer.viewed_at}`} className="flex items-center gap-3"><Avatar className="size-10"><AvatarImage src={viewer.avatar} alt="" /><AvatarFallback className="bg-[#ede9fe] text-xs font-semibold text-[#6d28d9]">{initials(viewer.name)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#403b63]">{viewer.name}{viewer.verified && <CheckCircle2 className="ml-1 inline size-3.5 text-[#7c3aed]" />}</p><p className="truncate text-xs text-[#9691ad]">{viewer.role || "Recruiter"}</p></div><time className="shrink-0 text-xs text-[#9691ad]">{formatDate(viewer.viewed_at)}</time></div>)}</div>}</SectionCard></div>
    <p className="flex items-center justify-center gap-2 pb-2 text-center text-xs text-[#9691ad]"><Globe2 className="size-3.5" /> Percentages compare this window with the previous equivalent period when data is available.</p>
  </div></main>;
}
