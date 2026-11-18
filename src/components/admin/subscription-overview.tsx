"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import {
  adminApi, type AdminSubscriptionRecord, type SubscriptionOverrideAction,
  type SubscriptionOfferInput, type SubscriptionOverrideInput,
} from "@/lib/api/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

function date(value?: string | null) {
  return value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
}

function errorMessage(error: unknown) {
  const value = error as { response?: { data?: { message?: string | string[] } }; message?: string };
  const message = value.response?.data?.message ?? value.message ?? "Subscription request failed";
  return Array.isArray(message) ? message.join(". ") : message;
}

function BillingRecord({ record, title }: { record: AdminSubscriptionRecord; title: string }) {
  const ending = record.cancel_at_period_end || ["expired", "cancelled", "paused"].includes(record.access_status);
  return (
    <div className="space-y-2 rounded-md border p-3">
      <h4 className="font-medium">{title}</h4>
      <dl className="grid grid-cols-2 gap-2">
        <dt className="text-muted-foreground">Plan</dt><dd>{record.plan_display_name}</dd>
        <dt className="text-muted-foreground">Status</dt><dd className="capitalize">{record.access_status.replaceAll("_", " ")}</dd>
        <dt className="text-muted-foreground">Billing cycle</dt><dd className="capitalize">{record.billing_cycle === "none" ? "No billing" : record.billing_cycle}{record.billing_cycle_inferred && " (inferred from period)"}</dd>
        <dt className="text-muted-foreground">{ending ? "Expiry / period end" : record.status === "trialing" ? "Trial ends" : "Renewal / period end"}</dt>
        <dd>{date(record.expires_at ?? record.current_period_end)}</dd>
        <dt className="text-muted-foreground">Cancellation</dt>
        <dd>{record.status === "cancelled" ? "Cancelled" : record.cancel_at_period_end ? `Scheduled for ${date(record.scheduled_cancellation_at ?? record.current_period_end)}` : "Not scheduled"}</dd>
        {record.cancellation_reason && <><dt className="text-muted-foreground">Cancellation reason</dt><dd>{record.cancellation_reason.replaceAll("_", " ")}</dd></>}
        {record.grace_period_ends_at && <><dt className="text-muted-foreground">Grace period ends</dt><dd>{date(record.grace_period_ends_at)}</dd></>}
        {record.scheduled_plan_key && <><dt className="text-muted-foreground">Scheduled plan</dt><dd>{record.scheduled_plan_key} · {date(record.scheduled_change_at)}</dd></>}
        {record.razorpay_subscription_id && <><dt className="text-muted-foreground">Razorpay ID</dt><dd className="break-all font-mono">{record.razorpay_subscription_id}</dd></>}
      </dl>
    </div>
  );
}

export function SubscriptionOverview({ userId, onChange }: { userId: string; onChange: () => void }) {
  const queryClient = useQueryClient();
  const queryKey = ["admin-user-subscription", userId];
  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () => adminApi.getUserSubscription(userId),
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: "always",
  });
  const [editing, setEditing] = useState(false);
  const [action, setAction] = useState<SubscriptionOverrideAction>("grant");
  const [plan, setPlan] = useState("");
  const [reason, setReason] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [review, setReview] = useState<SubscriptionOverrideInput | null>(null);
  const [offerReview, setOfferReview] = useState<SubscriptionOfferInput | null>(null);
  const [durationDays, setDurationDays] = useState("30");
  const [acknowledged, setAcknowledged] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: (payload: SubscriptionOverrideInput) => adminApi.updateUserSubscription(userId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      setReview(null);
      setEditing(false);
      setReason("");
      setEndsAt("");
      setAcknowledged(false);
      onChange();
    },
    onError: () => { void refetch(); setAcknowledged(false); },
  });
  const offerMutation = useMutation({
    mutationFn: (payload: SubscriptionOfferInput) => adminApi.createSubscriptionOffer(userId, payload),
    onSuccess: (result) => {
      setOfferReview(null);
      setEditing(false);
      setReason("");
      setAcknowledged(false);
      onChange();
      toast.success("Plan offer sent", {
        description: `The user has 7 days to respond. If accepted, access begins for ${offerReview?.duration_days ?? durationDays} days.`,
      });
      void refetch();
      return result;
    },
    onError: () => { void refetch(); setAcknowledged(false); },
  });

  // Refresh at expiry as well as polling: no stale admin-granted badge at the boundary.
  useEffect(() => {
    if (!data?.effective.expires_at) return;
    const delay = +new Date(data.effective.expires_at) - Date.now();
    if (delay < 0 || delay > 2_147_483_647) return;
    const timer = window.setTimeout(() => { void refetch(); }, delay + 100);
    return () => window.clearTimeout(timer);
  }, [data?.effective.expires_at, refetch]);

  const prepareReview = () => {
    if (!data) return;
    if (action !== "revoke" && action !== "extend") {
      const duration = Number(durationDays);
      if (!Number.isInteger(duration) || duration < 1 || duration > 3650) {
        setFormError("Offer duration must be from 1 to 3650 days.");
        return;
      }
      if (reason.trim().length < 3 || reason.trim().length > 2000) {
        setFormError("Enter a reason of 3–2000 characters.");
        return;
      }
      if (!plan) { setFormError("Select a plan."); return; }
      setFormError(null);
      mutation.reset();
      offerMutation.reset();
      setAcknowledged(false);
      setReview(null);
      setOfferReview({
        plan_key: plan,
        duration_days: duration,
        reason: reason.trim(),
        expected_revision: data.revision,
        billing_acknowledged: false,
      });
      return;
    }
    const end = new Date(endsAt);
    if (reason.trim().length < 3 || reason.trim().length > 2000) { setFormError("Enter a reason of 3–2000 characters."); return; }
    if (!Number.isFinite(+end) || +end <= Date.now()) { setFormError("Choose a future expiry date."); return; }
    if (action !== "revoke" && action !== "extend" && !plan) { setFormError("Select a plan."); return; }
    setFormError(null);
    mutation.reset();
    setAcknowledged(false);
    setReview({ action, plan_key: action === "revoke" || action === "extend" ? undefined : plan,
      reason: reason.trim(), ends_at: end.toISOString(), expected_revision: data.revision, billing_acknowledged: false });
  };

  return (
    <section aria-label="Current subscription" className="space-y-3 rounded-lg border border-border p-3 text-xs">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Current subscription & access</h3>
        <Button type="button" size="icon" variant="ghost" aria-label="Refresh subscription" disabled={isFetching} onClick={() => { void refetch(); }}>
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isPending && <div role="status" className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading subscription…</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{errorMessage(error)}. Refresh to retry.</AlertDescription></Alert>}
      {data && <>
        <div className="flex flex-wrap items-center gap-2">
          <strong>{data.effective.plan_display_name}</strong>
          <Badge variant="outline">{({ free: "Free access", paid: "Paid subscription", admin_granted: "Admin-granted access", admin_revoked: "Admin-revoked · free access", unbilled: "Unbilled access · legacy record" })[data.effective.source]}</Badge>
          <Badge variant="secondary" className="capitalize">{data.effective.status.replaceAll("_", " ")}</Badge>
        </div>
        <p className="text-muted-foreground">
          {data.effective.expires_at ? `Current access ends ${date(data.effective.expires_at)}` : "No access expiry"}
        </p>
        {data.subscription ? <BillingRecord record={data.subscription} title="Underlying subscription" /> : <div className="space-y-2">
          <p>No underlying subscription. Free access is the fallback.</p>
          <dl className="grid grid-cols-2 gap-2">
            <dt className="text-muted-foreground">Billing cycle</dt><dd>No billing</dd>
            <dt className="text-muted-foreground">Cancellation</dt><dd>Not applicable</dd>
          </dl>
        </div>}
        {data.paid_subscription && data.paid_subscription._id !== data.subscription?._id &&
          <BillingRecord record={data.paid_subscription} title="Latest paid subscription" />}
        {data.active_override && <div className="space-y-1 rounded-md border border-primary/30 bg-primary/5 p-3">
          <h4 className="font-medium">Active admin override · <span className="capitalize">{data.active_override.action}</span></h4>
          <p>{data.active_override.plan_key} · {date(data.active_override.starts_at)} – {date(data.active_override.ends_at)}</p>
          <p className="whitespace-pre-wrap break-words">{data.active_override.reason}</p>
        </div>}
        {data.usage.length > 0 && <div>
          <h4 className="mb-2 font-medium">Effective limits & usage</h4>
          <dl className="grid grid-cols-2 gap-2">
            {data.usage.map((item) => <div key={item.key} className="rounded-md bg-muted/40 p-2">
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="mt-1 font-medium">{item.used} / {item.limit}{item.used > item.limit && " · over limit"}</dd>
            </div>)}
          </dl>
        </div>}
        <p className="text-muted-foreground">{data.expiry_policy}</p>
        <p className="text-[10px] text-muted-foreground">Checked {date(data.as_of)} · refreshes every 30 seconds</p>
        {data.can_override && <Button size="sm" variant="outline" disabled={!!error || mutation.isPending} onClick={() => { setEditing(!editing); setReview(null); mutation.reset(); }}>
          {editing ? "Close override editor" : "Manage access override"}
        </Button>}
        {editing && <div className="space-y-3 border-t pt-3">
          {!review ? <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label htmlFor="override-action">Action</Label>
                <Select value={action} onValueChange={(value) => setAction(value as SubscriptionOverrideAction)}>
                  <SelectTrigger id="override-action"><SelectValue /></SelectTrigger>
                  <SelectContent>{(["grant", "upgrade", "downgrade", "extend", "revoke"] as const).map((value) => <SelectItem key={value} value={value} className="capitalize">{value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {action !== "revoke" && action !== "extend" && <div className="space-y-1"><Label htmlFor="override-plan">Access plan</Label>
                <Select value={plan} onValueChange={setPlan}>
                  <SelectTrigger id="override-plan"><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>{data.available_plans.map((item) => <SelectItem key={item.key} value={item.key}>{item.display_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>}
            </div>
            <p className="text-muted-foreground">
              {action === "revoke"
                ? "Revoke paid/admin access temporarily; free access remains. Billing continues. This takes effect immediately."
                : action === "extend"
                  ? "Keep the current non-free plan beyond its current access end. This takes effect immediately."
                  : "Plan changes are sent as an offer. The user must accept within 7 days; access starts only on acceptance and lasts for the selected duration."}
            </p>
            {action !== "revoke" && action !== "extend" ? (
              <div className="space-y-1"><Label htmlFor="offer-duration">Access duration after acceptance (days) *</Label><Input id="offer-duration" type="number" min={1} max={3650} step={1} value={durationDays} onChange={(event) => setDurationDays(event.target.value)} /></div>
            ) : (
              <div className="space-y-1"><Label htmlFor="override-end">Effective until (your local time) *</Label><Input id="override-end" type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} /></div>
            )}
            <div className="space-y-1"><Label htmlFor="override-reason">Reason *</Label><Textarea id="override-reason" maxLength={2000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why is this access change needed?" /></div>
            {formError && <p role="alert" className="text-destructive">{formError}</p>}
            <Button size="sm" onClick={prepareReview} disabled={!!error || isFetching}>Review {action === "revoke" || action === "extend" ? "override" : "offer"}</Button>
          </> : offerReview ? <>
            <h4 className="font-semibold">Review plan offer</h4>
            <p>Offer {data.available_plans.find((item) => item.key === offerReview.plan_key)?.display_name ?? offerReview.plan_key} to {data.effective.plan_display_name} access for {offerReview.duration_days} days.</p>
            <p>The offer expires in 7 days. If accepted, access begins at acceptance and ends {date(new Date(Date.now() + offerReview.duration_days * 86400000).toISOString())}.</p>
            <p className="whitespace-pre-wrap break-words">{offerReview.reason}</p>
            <Alert><AlertDescription>{data.billing_consequences}</AlertDescription></Alert>
            <p>{data.expiry_policy}</p>
            {offerReview.expected_revision !== data.revision && <p role="alert" className="text-destructive">Subscription changed. Go back and review the latest state.</p>}
            <label className="flex items-start gap-2"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} disabled={offerMutation.isPending} /><span>I understand the billing consequences and expiry behavior.</span></label>
            {offerMutation.error && <p role="alert" className="text-destructive">{errorMessage(offerMutation.error)}</p>}
            <div className="flex gap-2">
              <Button size="sm" disabled={!acknowledged || offerMutation.isPending || !!error || offerReview.expected_revision !== data.revision} onClick={() => offerMutation.mutate({ ...offerReview, billing_acknowledged: true })}>
                {offerMutation.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Send offer
              </Button>
              <Button size="sm" variant="ghost" disabled={offerMutation.isPending} onClick={() => setOfferReview(null)}>Back</Button>
            </div>
          </> : <>
            <h4 className="font-semibold">Review access change</h4>
            <p><span className="capitalize">{review.action}</span>: {data.effective.plan_display_name} → {review.action === "revoke" ? "Free access" : review.action === "extend" ? data.effective.plan_display_name : data.available_plans.find((item) => item.key === review.plan_key)?.display_name}</p>
            <p>Immediately on confirmation → {date(review.ends_at)}</p>
            <p className="whitespace-pre-wrap break-words">{review.reason}</p>
            <Alert><AlertDescription>{data.billing_consequences}</AlertDescription></Alert>
            <p>{data.expiry_policy}</p>
            {review.expected_revision !== data.revision && <p role="alert" className="text-destructive">Subscription changed. Go back and review the latest state.</p>}
            <label className="flex items-start gap-2"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} disabled={mutation.isPending} /><span>I understand the billing consequences and expiry behavior.</span></label>
            {mutation.error && <p role="alert" className="text-destructive">{errorMessage(mutation.error)}</p>}
            <div className="flex gap-2">
              <Button size="sm" variant={review.action === "revoke" ? "destructive" : "default"} disabled={!acknowledged || mutation.isPending || !!error || review.expected_revision !== data.revision} onClick={() => mutation.mutate({ ...review, billing_acknowledged: true })}>
                {mutation.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Apply override
              </Button>
              <Button size="sm" variant="ghost" disabled={mutation.isPending} onClick={() => setReview(null)}>Back</Button>
            </div>
          </>}
        </div>}
        <details className="border-t pt-3">
          <summary className="cursor-pointer font-medium">Override history ({data.history.length})</summary>
          <div className="mt-2 max-h-80 space-y-2 overflow-y-auto">
            {data.history.length === 0 && <p className="text-muted-foreground">No access overrides.</p>}
            {data.history.map((entry) => <div key={entry._id} className="space-y-1 rounded-md border p-2">
              <div className="flex justify-between gap-2"><strong className="capitalize">{entry.action} · {entry.plan_key}</strong><span>{data.active_override?._id === entry._id ? "Active" : entry.superseded_at && +new Date(entry.superseded_at) < +new Date(entry.ends_at) ? "Superseded" : "Expired"}</span></div>
              <p>From {entry.before.effective?.plan_display_name ?? entry.before.effective?.plan_key ?? "Free access"}</p>
              <p>{date(entry.starts_at)} – {date(entry.ends_at)}</p>
              {entry.superseded_at && <p>Replaced {date(entry.superseded_at)}</p>}
              <p className="whitespace-pre-wrap break-words">{entry.reason}</p>
              <p className="text-muted-foreground">By {typeof entry.admin_id === "object" ? entry.admin_id?.email ?? "Deleted admin" : entry.admin_id} · {date(entry.created_at)}</p>
              <p className="text-muted-foreground">{entry.billing_consequences}</p>
            </div>)}
          </div>
        </details>
      </>}
    </section>
  );
}
