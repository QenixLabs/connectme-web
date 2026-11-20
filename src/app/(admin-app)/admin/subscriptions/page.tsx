"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminApi, type SubscriptionAnalytics } from "@/lib/api";
import { plansApi } from "@/lib/api/plans";
import { queryKeys } from "@/lib/api/query-keys";
import { UserDetailPanel } from "@/components/admin/user-detail-panel";

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  trialing: "#3b82f6",
  pending: "#f59e0b",
  paused: "#f97316",
  past_due: "#ef4444",
  cancelled: "#6b7280",
  expired: "#9ca3af",
  grace_period: "#14b8a6",
};

const PLAN_COLORS = ["#4C8DF0", "#06b6d4", "#eab308", "#f97316", "#a855f7", "#22c55e"];

function getApiErrorMessage(err: unknown, fallback: string): string {
  const msg =
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ||
    (err instanceof Error ? err.message : null);
  return msg || fallback;
}

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
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-24" /> : (
          <>
            <div className="text-2xl font-semibold tabular-nums">{value}</div>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Filter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1 text-xs text-muted-foreground">
      {label}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-32 rounded-md border border-input bg-background px-2 text-sm text-foreground"
      >
        {children}
      </select>
    </label>
  );
}

export default function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<SubscriptionAnalytics>({
    queryKey: queryKeys.subscriptions.adminAnalytics(),
    queryFn: adminApi.getSubscriptionAnalytics,
  });
  const plans = useQuery({
    queryKey: queryKeys.plans.admin(),
    queryFn: plansApi.getAdminPlans,
  });

  const [tab, setTab] = useState("overview");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [planKey, setPlanKey] = useState("");
  const [planType, setPlanType] = useState("paid");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [billingInterval, setBillingInterval] = useState("");
  const [cancellationState, setCancellationState] = useState("");
  const [grantSearch, setGrantSearch] = useState("");
  const [grantPage, setGrantPage] = useState(1);
  const [grantRole, setGrantRole] = useState("");
  const [debouncedGrantSearch, setDebouncedGrantSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuerySearch(search.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedGrantSearch(grantSearch.trim());
      setGrantPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [grantSearch]);

  const subscriberParams = useMemo(() => ({
    page,
    limit: 15,
    search: querySearch || undefined,
    role: role || undefined,
    status: status || undefined,
    plan_key: planKey || undefined,
    plan_type: planType ? planType as "paid" | "free" : undefined,
    payment_status: paymentStatus
      ? paymentStatus as "paid" | "pending" | "failed" | "none"
      : undefined,
    billing_interval: billingInterval
      ? billingInterval as "monthly" | "yearly" | "unknown" | "none"
      : undefined,
    cancellation_state: cancellationState
      ? cancellationState as "scheduled" | "not_scheduled"
      : undefined,
  }), [
    page,
    querySearch,
    role,
    status,
    planKey,
    planType,
    paymentStatus,
    billingInterval,
    cancellationState,
  ]);
  const subscribers = useQuery({
    queryKey: ["subscriptions", "admin", "records", subscriberParams],
    queryFn: () => adminApi.getSubscriptions(subscriberParams),
    enabled: tab === "subscribers",
  });
  const grantParams = useMemo(() => ({
    page: grantPage,
    limit: 15,
    role: grantRole || undefined,
    search: debouncedGrantSearch || undefined,
  }), [grantPage, grantRole, debouncedGrantSearch]);
  const grants = useQuery({
    queryKey: ["subscriptions", "admin", "grants", grantParams],
    queryFn: () => adminApi.getSubscriptionAccessGrants(grantParams),
    enabled: tab === "admin-grants",
  });

  const trendData = data?.trends?.map((item) => ({
    date: item.date.slice(5),
    created: item.new_paid_subscriptions,
    cancelled: item.cancellations,
    revenue: item.actual_collected_revenue_paise / 100,
  })) ?? [];
  const revenueData = data?.trends?.map((item) => ({
    date: item.date.slice(5),
    revenue: item.actual_collected_revenue_paise / 100,
  })) ?? [];
  const userCounts = data?.user_counts;
  const paidFreeData = data?.paid_vs_free?.map((item) => ({
    name: item.category === "paid_access" ? "Paid-plan access" : "Free access",
    count: item.count,
    fill: item.category === "paid_access" ? "#4C8DF0" : "#94a3b8",
  })) ?? [];
  const planData = data?.effective_plan_distribution ?? [];

  const resetFilters = () => {
    setSearch("");
    setQuerySearch("");
    setRole("");
    setStatus("");
    setPlanKey("");
    setPlanType("");
    setPaymentStatus("");
    setBillingInterval("");
    setCancellationState("");
    setPage(1);
  };

  const refreshAfterUserChange = () => {
    void queryClient.invalidateQueries({ queryKey: ["subscriptions", "admin", "records"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.adminAnalytics() });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          A billing and access portal. Paid invoices, paid-plan access, and admin-granted access are counted separately.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{getApiErrorMessage(error, "Failed to load subscription analytics")}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Paid customers" value={userCounts?.paid_customers ?? 0}
          subtitle="Distinct accounts with at least one paid invoice" loading={isLoading} />
        <StatCard title="Paid-plan access" value={userCounts?.paid_plan_access_users ?? 0}
          subtitle="Current non-free entitlement; includes trials and grants" loading={isLoading} />
        <StatCard title="Active paid billing" value={userCounts?.active_paid_billing_users ?? 0}
          subtitle="Provider-backed billing; may differ from effective access" loading={isLoading} />
        <StatCard title="Free access" value={userCounts?.free_access_users ?? 0}
          subtitle={`Of ${userCounts?.total_users ?? 0} talent, recruiter, and provider accounts`} loading={isLoading} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="MRR" value={data ? formatRupee(data.mrr_paise) : "—"}
          subtitle="Monthly plans + yearly price normalized to 1/12" loading={isLoading} />
        <StatCard title="ARR" value={data?.arr_paise != null ? formatRupee(data.arr_paise) : "—"}
          subtitle="Monthly plans × 12 + full yearly plan price" loading={isLoading} />
        <StatCard title="Collected revenue" value={data
          ? formatRupee(data.actual_collected_revenue_paise ?? data.total_revenue_paise)
          : "—"}
          subtitle="Paid invoices only; lifetime total" loading={isLoading} />
        <StatCard title="Paid users churned (30d)" value={data?.churned_paid_users_30d ?? 0}
          subtitle="Distinct users with a paid-plan cancellation" loading={isLoading} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Trials", userCounts?.trial_users],
          ["Past due", userCounts?.past_due_users],
          ["Cancelled", userCounts?.cancelled_users],
          ["Expired", userCounts?.expired_users],
          ["Scheduled cancellation", userCounts?.scheduled_cancellation_users],
          ["Admin-granted access", userCounts?.admin_granted_users],
          ["Admin-revoked access", userCounts?.admin_revoked_users],
        ].map(([label, count]) => (
          <Card key={String(label)}>
            <CardContent className="flex items-center justify-between gap-2 p-4">
              <span className="text-xs text-muted-foreground">{label}</span>
              {isLoading ? <Skeleton className="h-6 w-8" /> : (
                <span className="text-lg font-semibold tabular-nums">{count ?? 0}</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {userCounts?.unknown_billing_cycle_subscriptions ? (
        <Alert>
          <AlertDescription>
            {userCounts.unknown_billing_cycle_subscriptions} active paid subscription(s) have no reliable billing interval and are excluded from MRR/ARR.
          </AlertDescription>
        </Alert>
      ) : null}
      {data && data.at_risk_mrr_paise > 0 && (
        <Alert>
          <AlertDescription>
            {formatRupee(data.at_risk_mrr_paise)} of estimated monthly recurring revenue is attached to past-due accounts and excluded from MRR/ARR.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscribers">Subscriber records</TabsTrigger>
          <TabsTrigger value="admin-grants">Admin grants</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Current paid vs free access</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  {isLoading ? <Skeleton className="h-full w-full" /> : paidFreeData.length === 0 ? (
                    <p className="py-28 text-center text-sm text-muted-foreground">No account data.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={paidFreeData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={92}
                          label={({ name, value }) => `${name}: ${value}`}>
                          {paidFreeData.map((item, index) => <Cell key={item.name} fill={item.fill || PLAN_COLORS[index]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Effective access by plan · distinct users</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  {isLoading ? <Skeleton className="h-full w-full" /> : planData.length === 0 ? (
                    <p className="py-28 text-center text-sm text-muted-foreground">No plan data.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={planData} margin={{ bottom: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="display_name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]}>
                          {planData.map((item, index) => (
                            <Cell key={item.plan_key} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Paid subscription growth and churn · 30 days</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  {isLoading ? <Skeleton className="h-full w-full" /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="created" name="New paid subscribers" stroke="#22c55e" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="cancelled" name="Paid cancellations" stroke="#ef4444" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Historical cancellations without a recorded cancellation timestamp use the record's last-updated date.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Collected revenue · 30 days</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  {isLoading ? <Skeleton className="h-full w-full" /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value: number) => `₹${value}`} />
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Collected"]} />
                        <Line type="monotone" dataKey="revenue" name="Collected" stroke="#4C8DF0" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Subscription records</h2>
            <p className="text-sm text-muted-foreground">
              Records can repeat an account when it has a subscription history; the overview metrics above count distinct users.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
            <label className="grid min-w-56 flex-1 gap-1 text-xs text-muted-foreground">
              Search email or profile name
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subscribers" />
            </label>
            <Filter label="Role" value={role} onChange={(value) => { setRole(value); setPage(1); }}>
              <option value="">All roles</option>
              <option value="talent">Talent</option>
              <option value="recruiter">Recruiter</option>
              <option value="provider">Provider</option>
            </Filter>
            <Filter label="Plan type" value={planType} onChange={(value) => { setPlanType(value); setPage(1); }}>
              <option value="">Paid and free</option>
              <option value="paid">Paid plans</option>
              <option value="free">Free plans</option>
            </Filter>
            <Filter label="Plan" value={planKey} onChange={(value) => { setPlanKey(value); setPage(1); }}>
              <option value="">All plans</option>
              {plans.data?.map((plan) => <option key={plan.key} value={plan.key}>{plan.display_name} · {plan.key}</option>)}
            </Filter>
            <Filter label="Subscription status" value={status} onChange={(value) => { setStatus(value); setPage(1); }}>
              <option value="">All statuses</option>
              {["active", "trialing", "past_due", "grace_period", "pending", "paused", "cancelled", "expired"].map((item) => (
                <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
              ))}
            </Filter>
            <Filter label="Latest payment" value={paymentStatus} onChange={(value) => { setPaymentStatus(value); setPage(1); }}>
              <option value="">Any payment</option>
              {["paid", "pending", "failed", "none"].map((item) => <option key={item} value={item}>{item}</option>)}
            </Filter>
            <Filter label="Billing cycle" value={billingInterval} onChange={(value) => { setBillingInterval(value); setPage(1); }}>
              <option value="">Any cycle</option>
              {["monthly", "yearly", "unknown", "none"].map((item) => <option key={item} value={item}>{item}</option>)}
            </Filter>
            <Filter label="Cancellation" value={cancellationState} onChange={(value) => { setCancellationState(value); setPage(1); }}>
              <option value="">Any state</option>
              <option value="scheduled">Scheduled</option>
              <option value="not_scheduled">Not scheduled</option>
            </Filter>
            <Button type="button" variant="outline" onClick={resetFilters}>Clear filters</Button>
          </div>

          {subscribers.error && (
            <Alert variant="destructive">
              <AlertDescription>{getApiErrorMessage(subscribers.error, "Failed to load subscribers")}</AlertDescription>
            </Alert>
          )}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-3">Account</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Subscription</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Cycle</th>
                  <th className="p-3">Renewal / end</th>
                  <th className="p-3">Cancellation</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.isLoading ? (
                  <tr><td colSpan={8} className="p-6"><Skeleton className="h-20 w-full" /></td></tr>
                ) : subscribers.data?.data.length ? subscribers.data.data.map((record) => (
                  <tr key={record._id} className="border-t">
                    <td className="p-3">
                      <div className="font-medium">{record.user?.display_name || record.user?.email || "Unknown user"}</div>
                      <div className="text-xs text-muted-foreground">{record.user?.email} · {record.user?.role || "Unknown role"}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{record.plan_display_name || record.plan_key}</div>
                      <div className="text-xs text-muted-foreground">{record.plan_key}</div>
                    </td>
                    <td className="p-3"><Badge variant={record.status === "active" ? "default" : "secondary"} className="capitalize">{record.status.replaceAll("_", " ")}</Badge></td>
                    <td className="p-3"><Badge variant={record.payment_status === "paid" ? "default" : "outline"} className="capitalize">{record.payment_status || "unknown"}</Badge></td>
                    <td className="p-3 capitalize">{record.billing_cycle || "unknown"}</td>
                    <td className="p-3">{record.current_period_end ? new Date(record.current_period_end).toLocaleDateString() : "—"}</td>
                    <td className="p-3">{record.cancel_at_period_end ? `Scheduled${record.scheduled_cancellation_at ? ` · ${new Date(record.scheduled_cancellation_at).toLocaleDateString()}` : ""}` : "—"}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedUserId(record.user?._id ?? record.user_id)}>Open user</Button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No subscription records match these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {subscribers.data ? `${subscribers.data.total.toLocaleString()} matching records` : "Loading records…"}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || subscribers.isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button>
              <span className="tabular-nums">Page {page} of {Math.max(subscribers.data?.total_pages ?? 1, 1)}</span>
              <Button variant="outline" size="sm" disabled={page >= (subscribers.data?.total_pages ?? 1) || subscribers.isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="admin-grants" className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Current admin-granted access</h2>
            <p className="text-sm text-muted-foreground">
              Access grants do not prove a payment or change the underlying billing record.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
            <label className="grid min-w-56 flex-1 gap-1 text-xs text-muted-foreground">
              Search user email
              <Input value={grantSearch} onChange={(event) => setGrantSearch(event.target.value)} placeholder="Search email" />
            </label>
            <Filter label="Role" value={grantRole} onChange={(value) => { setGrantRole(value); setGrantPage(1); }}>
              <option value="">All roles</option>
              <option value="talent">Talent</option>
              <option value="recruiter">Recruiter</option>
              <option value="provider">Provider</option>
            </Filter>
          </div>
          {grants.error && (
            <Alert variant="destructive">
              <AlertDescription>{getApiErrorMessage(grants.error, "Failed to load admin grants")}</AlertDescription>
            </Alert>
          )}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Granted plan</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Access starts</th>
                  <th className="p-3">Access ends</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {grants.isLoading ? (
                  <tr><td colSpan={6} className="p-6"><Skeleton className="h-20 w-full" /></td></tr>
                ) : grants.data?.data.length ? grants.data.data.map((grant) => (
                  <tr key={grant._id} className="border-t">
                    <td className="p-3">
                      <div className="font-medium">{grant.user.email}</div>
                      <div className="text-xs capitalize text-muted-foreground">{grant.user.role}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{grant.plan_display_name}</div>
                      <div className="text-xs text-muted-foreground">{grant.plan_key}</div>
                    </td>
                    <td className="p-3 capitalize">{grant.action}</td>
                    <td className="p-3">{new Date(grant.starts_at).toLocaleDateString()}</td>
                    <td className="p-3">{new Date(grant.ends_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedUserId(grant.user_id)}>Open user</Button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No current admin-granted access matches these filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {grants.data ? `${grants.data.total.toLocaleString()} active grants` : "Loading grants…"}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={grantPage <= 1 || grants.isFetching} onClick={() => setGrantPage((value) => value - 1)}>Previous</Button>
              <span className="tabular-nums">Page {grantPage} of {Math.max(grants.data?.total_pages ?? 1, 1)}</span>
              <Button variant="outline" size="sm" disabled={grantPage >= (grants.data?.total_pages ?? 1) || grants.isFetching} onClick={() => setGrantPage((value) => value + 1)}>Next</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <UserDetailPanel
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onStatusChange={refreshAfterUserChange}
      />
    </div>
  );
}
