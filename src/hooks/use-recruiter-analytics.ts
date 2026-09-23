"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api/campaigns";
import type {
  Campaign,
  CampaignAnalytics,
  CampaignApplicationsResponse,
  CampaignDemographics,
} from "@/lib/api/campaigns";
import { useRecruiterCampaigns } from "@/hooks/use-campaigns";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type AnalyticsRangeKey = "30d" | "90d" | "6m" | "all";

export interface AnalyticsRange {
  from?: string;
  to?: string;
}

export function rangeToParams(range: AnalyticsRangeKey): AnalyticsRange {
  const to = new Date();
  if (range === "all") return {};
  const from = new Date();
  if (range === "30d") from.setDate(from.getDate() - 30);
  if (range === "90d") from.setDate(from.getDate() - 90);
  if (range === "6m") from.setMonth(from.getMonth() - 6);
  return { from: from.toISOString(), to: to.toISOString() };
}

export interface FunnelStage {
  label: string;
  value: number;
  pct: number;
}

export interface TrendPoint {
  key: string;
  label: string;
  applications: number;
  hired: number;
}

export interface BestCampaign {
  id: string;
  name: string;
  roleType?: string;
  applications: number;
  hired: number;
  shortlisted: number;
  conversion: number;
}

export interface LocationBreakdown {
  city: string;
  count: number;
  pct: number;
}

export interface RecruiterAnalytics {
  campaigns: Campaign[];
  roleTypes: string[];
  totals: {
    campaigns: number;
    activeCampaigns: number;
    applications: number;
    shortlisted: number;
    hired: number;
    pending: number;
    rejected: number;
    invites: number;
    invitesAccepted: number;
    responseRate: number;
  };
  funnel: FunnelStage[];
  trend: TrendPoint[];
  bestCampaigns: BestCampaign[];
  avgTimeToHireDays: number | null;
  avgTimeToDecisionDays: number | null;
  locations: LocationBreakdown[];
  professions: Array<{ name: string; count: number }>;
  gender: Record<string, number>;
  statusBreakdown: { pending: number; accepted: number; rejected: number };
  isLoading: boolean;
  isError: boolean;
}

/** Cap per-campaign detail fan-out so the page stays fast. */
const MAX_DETAIL_CAMPAIGNS = 12;
const APPLICATIONS_PAGE_SIZE = 50;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

function lastNMonthKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

function daysBetween(a: string, b: string): number | null {
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  return (end - start) / 86_400_000;
}

/* -------------------------------------------------------------------------- */
/*                                    Hook                                    */
/* -------------------------------------------------------------------------- */

export function useRecruiterAnalytics(
  range: AnalyticsRangeKey = "90d",
  roleType = "",
): RecruiterAnalytics {
  const { from, to } = useMemo(() => rangeToParams(range), [range]);

  const campaignsQuery = useRecruiterCampaigns({
    sort: "newest",
    limit: 50,
    ...(roleType ? { role_type: roleType } : {}),
  });

  const allCampaigns = useMemo(
    () => campaignsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [campaignsQuery.data],
  );

  const roleTypes = useMemo(() => {
    const set = new Set<string>();
    for (const c of allCampaigns) if (c.role_type) set.add(c.role_type);
    if (roleType) set.add(roleType);
    return [...set].sort();
  }, [allCampaigns, roleType]);

  // Drafts carry no pipeline signal — analyse active + closed campaigns.
  const analysable = useMemo(
    () =>
      allCampaigns
        .filter((c) => c.status !== "draft")
        .slice(0, MAX_DETAIL_CAMPAIGNS),
    [allCampaigns],
  );
  const ids = useMemo(() => analysable.map((c) => c._id), [analysable]);

  const applicationsQueries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["campaigns", "analytics-rollup", "applications", id],
      queryFn: () =>
        campaignsApi.getCampaignApplications(id, {
          limit: APPLICATIONS_PAGE_SIZE,
          sort: "newest",
        }),
      staleTime: 60_000,
    })),
  });

  const analyticsQueries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["campaigns", "analytics-rollup", "analytics", id, from, to],
      queryFn: () =>
        campaignsApi.getCampaignAnalytics(id, {
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        }),
      staleTime: 60_000,
    })),
  });

  const demographicsQueries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["campaigns", "analytics-rollup", "demographics", id],
      queryFn: () => campaignsApi.getCampaignDemographics(id),
      staleTime: 60_000,
    })),
  });

  // Lightweight invite totals come from the recruiter-wide invites endpoint.
  const invitesQuery = useQuery({
    queryKey: ["campaigns", "analytics-rollup", "recruiter-invites"],
    queryFn: () => campaignsApi.getRecruiterInvites(),
    staleTime: 60_000,
  });

  const invitesData = invitesQuery.data;
  const campaignsLoading = campaignsQuery.isLoading;
  const campaignsError = campaignsQuery.isError;

  return useMemo<RecruiterAnalytics>(() => {
    const appResults = applicationsQueries
      .map((q) => q.data)
      .filter((d): d is CampaignApplicationsResponse => Boolean(d));
    const analyticsResults = analyticsQueries
      .map((q) => q.data)
      .filter((d): d is CampaignAnalytics => Boolean(d));
    const demoResults = demographicsQueries
      .map((q) => q.data)
      .filter((d): d is CampaignDemographics => Boolean(d));

    const totals = {
      campaigns: allCampaigns.length,
      activeCampaigns: allCampaigns.filter((c) => c.status === "active").length,
      applications: 0,
      shortlisted: 0,
      hired: 0,
      pending: 0,
      rejected: 0,
      invites: 0,
      invitesAccepted: 0,
      responseRate: 0,
    };

    for (const r of appResults) {
      totals.applications += r.total ?? 0;
      totals.shortlisted += r.shortlisted ?? 0;
      totals.hired += r.accepted ?? 0;
      totals.pending += r.pending ?? 0;
      totals.rejected += r.rejected ?? 0;
    }
    for (const a of analyticsResults) {
      totals.invites += a.total_invites ?? 0;
      totals.invitesAccepted += a.accepted_invites ?? 0;
    }
    totals.responseRate =
      totals.invites > 0 ? totals.invitesAccepted / totals.invites : 0;

    const base = Math.max(totals.applications, 1);
    const funnel: FunnelStage[] = [
      { label: "Applications", value: totals.applications, pct: 100 },
      {
        label: "Shortlisted",
        value: totals.shortlisted,
        pct: Math.round((totals.shortlisted / base) * 100),
      },
      {
        label: "Pending review",
        value: totals.pending,
        pct: Math.round((totals.pending / base) * 100),
      },
      {
        label: "Hired",
        value: totals.hired,
        pct: Math.round((totals.hired / base) * 100),
      },
    ];

    // --- Hiring trend: merge per-campaign daily series, bucket by month.
    const monthCount = range === "30d" ? 2 : range === "90d" ? 3 : 6;
    const keys = lastNMonthKeys(monthCount);
    const appsByMonth = new Map(keys.map((k) => [k, 0]));
    for (const a of analyticsResults) {
      for (const point of a.applications_over_time ?? []) {
        const d = new Date(point.date);
        if (Number.isNaN(d.getTime())) continue;
        const k = monthKey(d);
        if (appsByMonth.has(k)) {
          appsByMonth.set(k, (appsByMonth.get(k) ?? 0) + (point.count ?? 0));
        }
      }
    }
    // Hired-over-time is derived from accepted-application timestamps
    // (the backend exposes no hired time-series endpoint).
    const hiredByMonth = new Map(keys.map((k) => [k, 0]));
    const hireDurations: number[] = [];
    const decisionDurations: number[] = [];
    for (const r of appResults) {
      for (const app of r.data ?? []) {
        const created = app.created_at;
        const updated = app.updated_at;
        if (app.status === "accepted") {
          const d = new Date(updated || created);
          if (!Number.isNaN(d.getTime())) {
            const k = monthKey(d);
            if (hiredByMonth.has(k)) {
              hiredByMonth.set(k, (hiredByMonth.get(k) ?? 0) + 1);
            }
          }
          const dur = daysBetween(created, updated || created);
          if (dur !== null) hireDurations.push(dur);
        }
        if (app.status === "accepted" || app.status === "rejected") {
          const dur = daysBetween(created, updated || created);
          if (dur !== null) decisionDurations.push(dur);
        }
      }
    }
    const trend: TrendPoint[] = keys.map((k) => ({
      key: k,
      label: monthLabel(k),
      applications: appsByMonth.get(k) ?? 0,
      hired: hiredByMonth.get(k) ?? 0,
    }));

    // --- Best performing campaigns by hires, then applications.
    const byIdApps = new Map(
      ids.map((id, i) => [id, appResults[i]] as const),
    );
    const bestCampaigns: BestCampaign[] = analysable
      .map((c) => {
        const r = byIdApps.get(c._id);
        const applications = r?.total ?? c.applications_count ?? 0;
        const hired = r?.accepted ?? 0;
        const shortlisted = r?.shortlisted ?? 0;
        return {
          id: c._id,
          name: c.name,
          roleType: c.role_type,
          applications,
          hired,
          shortlisted,
          conversion: applications > 0 ? (hired / applications) * 100 : 0,
        };
      })
      .sort((a, b) => b.hired - a.hired || b.applications - a.applications)
      .slice(0, 5);

    const avg = (xs: number[]): number | null =>
      xs.length === 0
        ? null
        : Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10;
    const avgTimeToHireDays = avg(hireDurations);
    const avgTimeToDecisionDays = avg(decisionDurations);

    // --- Locations / professions / gender from demographics.
    const locCount = new Map<string, number>();
    const profCount = new Map<string, number>();
    const gender: Record<string, number> = {};
    for (const d of demoResults) {
      for (const l of d.locations ?? []) {
        if (!l.city) continue;
        locCount.set(l.city, (locCount.get(l.city) ?? 0) + l.count);
      }
      for (const p of d.professions ?? []) {
        if (!p.name) continue;
        profCount.set(p.name, (profCount.get(p.name) ?? 0) + p.count);
      }
      for (const [g, n] of Object.entries(d.gender ?? {})) {
        gender[g] = (gender[g] ?? 0) + n;
      }
    }
    const locTotal = Math.max(
      [...locCount.values()].reduce((s, n) => s + n, 0),
      1,
    );
    const locations: LocationBreakdown[] = [...locCount.entries()]
      .map(([city, count]) => ({
        city,
        count,
        pct: Math.round((count / locTotal) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const professions = [...profCount.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const statusBreakdown = {
      pending: totals.pending,
      accepted: totals.hired,
      rejected: totals.rejected,
    };

    const invites = invitesData ?? [];
    if (invites.length > 0 && analyticsResults.length === 0) {
      totals.invites = invites.length;
      totals.invitesAccepted = invites.filter(
        (i) => i.status === "accepted",
      ).length;
      totals.responseRate =
        totals.invites > 0 ? totals.invitesAccepted / totals.invites : 0;
    }

    const isLoading =
      campaignsLoading ||
      (ids.length > 0 &&
        (applicationsQueries.some((q) => q.isLoading) ||
          analyticsQueries.some((q) => q.isLoading) ||
          demographicsQueries.some((q) => q.isLoading)));
    const isError =
      campaignsError ||
      applicationsQueries.some((q) => q.isError) ||
      analyticsQueries.some((q) => q.isError) ||
      demographicsQueries.some((q) => q.isError);

    return {
      campaigns: analysable,
      roleTypes,
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
      isLoading,
      isError,
    };
  }, [
    allCampaigns,
    roleTypes,
    analysable,
    ids,
    applicationsQueries,
    analyticsQueries,
    demographicsQueries,
    invitesData,
    campaignsLoading,
    campaignsError,
    range,
  ]);
}
