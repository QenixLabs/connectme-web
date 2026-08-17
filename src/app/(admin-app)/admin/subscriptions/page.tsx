"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminApi, type SubscriptionAnalytics } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";

function getApiErrorMessage(err: unknown, fallback: string): string {
  const msg =
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ||
    (err instanceof Error ? err.message : null);
  return msg || fallback;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  trialing: "#3b82f6",
  pending: "#f59e0b",
  paused: "#f97316",
  past_due: "#ef4444",
  cancelled: "#6b7280",
  expired: "#9ca3af",
};

const PLAN_COLORS = ["#eab308", "#f97316", "#8b5cf6", "#06b6d4"];

const CANCEL_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#6b7280"];

function formatRupee(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

function StatCard({
  title,
  value,
  subtitle,
  loading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-semibold">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminSubscriptionsPage() {
  const { data, isLoading, error } = useQuery<SubscriptionAnalytics>({
    queryKey: queryKeys.subscriptions.adminAnalytics(),
    queryFn: adminApi.getSubscriptionAnalytics,
  });

  const statusData = data
    ? Object.entries(data.counts_by_status).map(([status, count]) => ({
        status,
        count,
        fill: STATUS_COLORS[status] || "#94a3b8",
      }))
    : [];

  const planData = data?.counts_by_plan ?? [];
  const activePlanData = planData.filter(
    (p) => p.plan_key !== "recruiter_free"
  );

  const trendData = data
    ? data.recent_subscriptions.map((item, index) => ({
        date: item.date.slice(5),
        created: item.count,
        cancelled: data.recent_cancellations[index]?.count ?? 0,
        scheduled: data.recent_scheduled_cancellations[index]?.count ?? 0,
      }))
    : [];

  const cancelReasonData = data?.cancellation_reasons ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Subscriptions
        </h1>
        <p className="text-sm text-muted-foreground">
          Subscription analytics and revenue overview.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(error, "Failed to load subscription analytics")}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Subscriptions"
          value={data?.active_subscriptions ?? 0}
          loading={isLoading}
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={data ? formatRupee(data.mrr_paise) : 0}
          subtitle="Approximate MRR from active paid plans"
          loading={isLoading}
        />
        <StatCard
          title="Total Revenue"
          value={data ? formatRupee(data.total_revenue_paise) : 0}
          subtitle="Lifetime paid invoice total"
          loading={isLoading}
        />
        <StatCard
          title="Active Paid Plans"
          value={
            data
              ? data.counts_by_plan
                  .filter((p) => p.plan_key !== "recruiter_free")
                  .reduce((sum, p) => sum + p.count, 0)
              : 0
          }
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscriptions by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : statusData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-24">
                  No subscription data.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : activePlanData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-24">
                  No active plans.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activePlanData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="display_name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {activePlanData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PLAN_COLORS[index % PLAN_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : trendData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-24">
                  No recent activity.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="created"
                      name="Created"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="cancelled"
                      name="Cancelled"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="scheduled"
                      name="Scheduled for cancellation"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cancellation Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : cancelReasonData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-24">
                  No cancellations yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cancelReasonData}
                      dataKey="count"
                      nameKey="reason"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name }) => name?.toString() || ""}
                    >
                      {cancelReasonData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CANCEL_COLORS[index % CANCEL_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
