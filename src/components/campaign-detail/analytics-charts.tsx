"use client";

import { useMemo } from "react";
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
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { CampaignAnalytics, CampaignDemographics } from "@/lib/api/campaigns";

const STATUS_COLORS = {
  pending: "oklch(0.78 0.16 75)",
  accepted: "oklch(0.75 0.18 155)",
  rejected: "oklch(0.62 0.22 25)",
};

const GENDER_COLORS: Record<string, string> = {
  male: "oklch(0.58 0.16 255)",
  female: "oklch(0.7 0.15 295)",
  other: "oklch(0.7 0.12 195)",
};

function ApplicationsChartSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card p-5">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="mt-3 h-3 w-20" />
      <Skeleton className="mt-4 h-[260px] w-full rounded-lg" />
    </Card>
  );
}

function DonutCardSkeleton({ title }: { title: string }) {
  return (
    <Card className="flex flex-col overflow-hidden border-border bg-card p-5">
      <Skeleton className="h-5 w-40" />
      <div className="mx-auto mt-4 h-[170px] w-[170px]">
        <Skeleton className="h-full w-full rounded-full" />
      </div>
      <div className="mt-5 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </Card>
  );
}

export function ApplicationsChart({
  analytics,
  isLoading,
}: {
  analytics: CampaignAnalytics | undefined;
  isLoading: boolean;
}) {
  const data = useMemo(() => {
    if (!analytics?.applications_over_time) return [];
    return analytics.applications_over_time.map((d) => ({
      date: d.date,
      applications: d.count,
    }));
  }, [analytics]);

  const maxValue = useMemo(() => {
    if (data.length === 0) return 4;
    const max = Math.max(...data.map((d) => d.applications), 0);
    return Math.max(max + 1, 4);
  }, [data]);

  if (isLoading) return <ApplicationsChartSkeleton />;

  return (
    <Card className="overflow-hidden border-border bg-card p-5">
      <h3 className="font-display text-base font-semibold">Applications Over Time</h3>
      <p className="mt-3 text-xs text-muted-foreground">Applications</p>
      <div className="mt-2 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="appsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              stroke="var(--border)"
              tickLine={false}
            />
            <YAxis
              domain={[0, maxValue]}
              ticks={Array.from({ length: maxValue + 1 }, (_, i) => i)}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              stroke="var(--border)"
              tickLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(l) => `${l}`}
                  formatter={(v) => [v as number, "Applications"]}
                />
              }
            />
            <Area
              type="linear"
              dataKey="applications"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#appsFill)"
              dot={{ r: 4, fill: "var(--accent)", stroke: "var(--background)", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function DonutCard({
  title,
  total,
  delta,
  data,
  isLoading,
}: {
  title: string;
  total: number;
  delta: number;
  data: Array<{ label: string; value: number; pct: number; color: string }>;
  isLoading: boolean;
}) {
  if (isLoading) return <DonutCardSkeleton title={title} />;

  return (
    <Card className="flex flex-col overflow-hidden border-border bg-card p-5">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <div className="relative mx-auto mt-4 h-[170px] w-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={0}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {data.map((s) => (
                <Cell key={s.label} fill={s.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--popover-foreground)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-2xl font-bold leading-tight">{total}</span>
          <span className="flex items-center gap-0.5 text-[11px] font-medium text-[var(--success)]">
            <TrendingUp className="size-3" /> {delta}
          </span>
          <span className="text-[10px] text-muted-foreground">vs last week</span>
        </div>
      </div>

      <ul className="mt-5 space-y-2 text-sm">
        {data.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-foreground/90">{s.label}</span>
            <span className="ml-auto text-muted-foreground">
              {s.value} ({s.pct}%)
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function StatusBreakdownCard({
  analytics,
  isLoading,
}: {
  analytics: CampaignAnalytics | undefined;
  isLoading: boolean;
}) {
  const total = analytics?.total_applications ?? 0;
  const sb = analytics?.status_breakdown;

  const data = useMemo(() => {
    if (!sb) return [];
    const items = [
      { label: "Pending", value: sb.pending, color: STATUS_COLORS.pending },
      { label: "Accepted", value: sb.accepted, color: STATUS_COLORS.accepted },
      { label: "Rejected", value: sb.rejected, color: STATUS_COLORS.rejected },
    ];
    return items.map((i) => ({
      ...i,
      pct: total > 0 ? Math.round((i.value / total) * 100) : 0,
    }));
  }, [sb, total]);

  const delta = useMemo(() => {
    if (!analytics) return 0;
    return analytics.accepted_invites;
  }, [analytics]);

  return (
    <DonutCard
      title="Status Breakdown"
      total={total}
      delta={delta}
      data={data}
      isLoading={isLoading}
    />
  );
}

export function GenderDistributionCard({
  demographics,
  isLoading,
}: {
  demographics: CampaignDemographics | undefined;
  isLoading: boolean;
}) {
  const genderData = demographics?.gender ?? {};
  const total = Object.values(genderData).reduce((a, b) => a + b, 0);

  const data = useMemo(() => {
    return Object.entries(genderData).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      pct: total > 0 ? Math.round((value / total) * 100) : 0,
      color: GENDER_COLORS[key] ?? "oklch(0.7 0.12 195)",
    }));
  }, [genderData, total]);

  return (
    <DonutCard
      title="Gender Distribution"
      total={total}
      delta={0}
      data={data}
      isLoading={isLoading}
    />
  );
}
