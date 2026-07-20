"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { motion } from "motion/react";
import {
  Users,
  ShieldCheck,
  FolderKanban,
  Flag,
  CheckCircle,
  UserX,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileSearch,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApi, type DashboardStats, type DashboardActivity } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const CHART_COLORS = {
  artists: "#6366f1",
  brands: "#f59e0b",
  admins: "#10b981",
  pending: "#f97316",
  resolved: "#10b981",
  suspended: "#ef4444",
  highPriority: "#dc2626",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

type MetricKey = Exclude<keyof DashboardActivity, 'days'>;

const METRIC_OPTIONS: { value: MetricKey; label: string }[] = [
  { value: "signups", label: "User Signups" },
  { value: "reports_created", label: "Reports Created" },
  { value: "reports_resolved", label: "Reports Resolved" },
  { value: "campaigns_created", label: "Campaigns" },
  { value: "verifications_submitted", label: "Verifications" },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-7 w-20 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ElementType;
  accentClass: string;
}

function StatCard({ label, value, sublabel, icon: Icon, accentClass }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden border-l-[3px] hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {sublabel && (
              <p className="text-xs text-muted-foreground">{sublabel}</p>
            )}
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", accentClass)}>
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: Record<string, unknown>) {
  if (active && payload && Array.isArray(payload) && payload.length) {
    const data = payload[0] as { value: number; name?: string };
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
        <p className="font-medium text-foreground">{data.name ?? label as string ?? ""}</p>
        <p className="text-muted-foreground">{data.value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<DashboardActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("signups");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminApi.getDashboardStats(),
      adminApi.getDashboardActivity(7),
    ])
      .then(([statsData, activityData]) => {
        if (!cancelled) {
          setStats(statsData);
          setActivity(activityData);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load dashboard statistics"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const platformData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Artists", value: stats.total_artists, color: CHART_COLORS.artists },
      { name: "Brands", value: stats.total_brands, color: CHART_COLORS.brands },
      { name: "Admins", value: stats.total_admins, color: CHART_COLORS.admins },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const totalPlatformUsers = useMemo(
    () => platformData.reduce((sum, d) => sum + d.value, 0),
    [platformData],
  );

  const chartData = useMemo(() => {
    if (!activity) return [];
    const series = activity[selectedMetric];
    return series.map((d) => ({
      day: format(parseISO(d.date), "EEE"),
      value: d.count,
    }));
  }, [activity, selectedMetric]);

  const metricLabel = useMemo(
    () => METRIC_OPTIONS.find((m) => m.value === selectedMetric)?.label ?? "Activity",
    [selectedMetric],
  );

  const moderationSummary = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "Pending Reports",
        value: stats.pending_reports,
        color: CHART_COLORS.pending,
        icon: AlertTriangle,
      },
      {
        label: "Resolved Today",
        value: stats.resolved_today,
        color: CHART_COLORS.resolved,
        icon: CheckCircle,
      },
      {
        label: "Suspended Users",
        value: stats.suspended_users,
        color: CHART_COLORS.suspended,
        icon: UserX,
      },
      {
        label: "High Priority",
        value: stats.high_priority_reports,
        color: CHART_COLORS.highPriority,
        icon: Flag,
      },
      {
        label: "Avg Resolution",
        value: stats.avg_resolution_hours,
        suffix: "h",
        color: "#6b7280",
        icon: Clock,
      },
    ];
  }, [stats]);

  const quickActions = [
    {
      label: "Review Verifications",
      description: "Approve or reject pending identity verifications",
      icon: ShieldCheck,
      iconBg: "bg-amber-50 text-amber-600",
      href: "/admin/verifications",
    },
    {
      label: "Manage Reports",
      description: "Review and resolve user-submitted reports",
      icon: Flag,
      iconBg: "bg-rose-50 text-rose-600",
      href: "/admin/reports",
    },
    {
      label: "Browse Users",
      description: "View, search, and manage all platform users",
      icon: Users,
      iconBg: "bg-blue-50 text-blue-600",
      href: "/admin/users",
    },
  ];

  const today = useMemo(() => format(new Date(), "EEEE, MMMM d, yyyy"), []);
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {greeting}, {stats ? "Admin" : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {today} &mdash; Here&apos;s what&apos;s happening across the platform.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Platform operational
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <StatCard
            label="Total Artists"
            value={stats.total_artists.toLocaleString()}
            sublabel="Registered talent"
            icon={Users}
            accentClass="border-l-indigo-500 bg-indigo-50 text-indigo-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Verified Brands"
            value={stats.total_brands.toLocaleString()}
            sublabel="Registered recruiters"
            icon={ShieldCheck}
            accentClass="border-l-amber-500 bg-amber-50 text-amber-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Active Projects"
            value={stats.active_campaigns.toLocaleString()}
            sublabel="Live campaigns"
            icon={FolderKanban}
            accentClass="border-l-emerald-500 bg-emerald-50 text-emerald-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Pending Verification"
            value={stats.pending_verifications.toLocaleString()}
            sublabel="Awaiting review"
            icon={FileSearch}
            accentClass="border-l-rose-500 bg-rose-50 text-rose-600"
          />
        </motion.div>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Weekly Activity</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {metricLabel} over the past 7 days
                </CardDescription>
              </div>
              <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricKey)}>
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRIC_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#activityGradient)"
                  dot={{ r: 3, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Platform Overview</CardTitle>
            <CardDescription className="text-xs mt-0.5">User distribution by role</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {platformData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-2">
              {platformData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {entry.name}{" "}
                    <span className="font-medium text-foreground">
                      {totalPlatformUsers > 0
                        ? Math.round((entry.value / totalPlatformUsers) * 100)
                        : 0}
                      %
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Quick actions + Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Frequently used administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pb-5">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="flex w-full items-center gap-4 rounded-lg border border-border p-3 text-left transition-all duration-150 hover:bg-accent hover:border-accent-foreground/10 group"
              >
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shrink-0", action.iconBg)}>
                  <action.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-150" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Moderation overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Moderation Overview</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Content and user moderation summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-5">
            {moderationSummary.map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                    style={{
                      backgroundColor: `${m.color}14`,
                      color: m.color,
                    }}
                  >
                    <m.icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm text-muted-foreground">{m.label}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {m.value.toLocaleString()}
                  {m.suffix && (
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">
                      {m.suffix}
                    </span>
                  )}
                </span>
              </div>
            ))}
            <div className="pt-2">
              <button
                onClick={() => router.push("/admin/reports")}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                View all reports
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
