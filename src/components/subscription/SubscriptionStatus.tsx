"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { usePopup } from "@/hooks/use-popup";
import { Loader2, AlertCircle, CheckCircle2, RefreshCcw, Zap, ChevronRight } from "lucide-react";
import { subscriptionsApi, type SubscriptionWithPlan, useSubscriptionUsage } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import { authStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const PLAN_BADGE_STYLES: Record<string, string> = {
  recruiter_pro: "bg-amber-100 text-amber-800 border-amber-200",
  recruiter_business: "bg-yellow-100 text-yellow-800 border-yellow-200",
  talent_verified: "bg-blue-100 text-blue-800 border-blue-200",
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  trialing: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  past_due: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  expired: "bg-gray-100 text-gray-800 border-gray-200",
  paused: "bg-orange-100 text-orange-800 border-orange-200",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  trialing: "Trialing",
  pending: "Pending payment",
  past_due: "Past Due",
  cancelled: "Cancelled",
  expired: "Expired",
  paused: "Paused",
};

const CANCELLATION_REASONS = [
  { value: "too_expensive", label: "Too expensive" },
  { value: "missing_features", label: "Missing features" },
  { value: "not_using", label: "Not using enough" },
  { value: "other", label: "Other" },
];

const FREE_FEATURES = [
  "Send unlimited messages",
  "Launch unlimited campaigns",
  "Get verified recruiter badge",
  "Priority support",
];

function planBadgeColor(planKey: string | undefined) {
  return PLAN_BADGE_STYLES[planKey || ""] || "bg-gray-100 text-gray-800 border-gray-200";
}

function statusBadgeColor(status: string | undefined) {
  return STATUS_BADGE_STYLES[status || ""] || "bg-gray-100 text-gray-800 border-gray-200";
}

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function LuxeSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-luxe">
      <div className="px-5 pt-4 pb-1">
        <Skeleton className="h-3 w-20 rounded-full" />
      </div>
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-36 rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

function LuxeError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-luxe">
      <div className="px-5 py-4 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-error shrink-0" strokeWidth={1.5} />
        <span className="text-[13px] text-ink-soft">Failed to load subscription</span>
        <button
          onClick={onRetry}
          className="ml-auto rounded-full bg-cream hover:bg-cream-hover p-1.5 transition-colors"
          aria-label="Retry"
        >
          <RefreshCcw className="h-3.5 w-3.5 text-ink-muted" />
        </button>
      </div>
    </div>
  );
}

export function SubscriptionStatus({ variant = "default" }: { variant?: "default" | "luxe" }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const popup = usePopup();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<SubscriptionWithPlan>({
    queryKey: queryKeys.subscriptions.me(),
    queryFn: subscriptionsApi.getMySubscription,
  });

  const { data: usage, isLoading: usageLoading } = useSubscriptionUsage();

  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => subscriptionsApi.cancelSubscription(reason),
    onSuccess: () => {
      popup.show({ title: "Plan will cancel at end of billing period", variant: "success" });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.me() });
      authStore.getState().fetchUser().catch(() => {});
      setConfirmOpen(false);
      setCancelReason("");
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to cancel subscription";
      popup.show({ title: message, variant: "error" });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => subscriptionsApi.resumeSubscription(),
    onSuccess: () => {
      popup.show({ title: "Subscription resumed", variant: "success" });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.me() });
      authStore.getState().fetchUser().catch(() => {});
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to resume subscription";
      popup.show({ title: message, variant: "error" });
    },
  });

  // --- Loading state ---
  if (isLoading) {
    if (variant === "luxe") return <LuxeSkeleton />;
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-28" />
        </CardContent>
      </Card>
    );
  }

  // --- Error state ---
  if (error) {
    if (variant === "luxe") return <LuxeError onRetry={() => refetch()} />;
    return (
      <Card>
        <CardContent className="pt-6 flex items-center gap-2 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>Failed to load subscription status</span>
          <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label="Retry loading subscription">
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const subscription = data?.subscription;
  const plan = data?.plan;
  const isFree = subscription?.plan_key === "recruiter_free" || !subscription?.plan_key;
  const isCancelled = subscription?.status === "cancelled" || subscription?.status === "expired";
  const isPastDue = subscription?.status === "past_due";
  const isExpired = subscription?.status === "expired";
  const showRenewal = !isFree && !isCancelled && subscription?.current_period_end;

  // --- Luxe variant ---
  if (variant === "luxe") {
    const statusDotColor = isPastDue
      ? "bg-red-400"
      : subscription?.cancel_at_period_end
        ? "bg-amber-400"
        : "bg-emerald-400";

    const statusLabel = subscription?.cancel_at_period_end
      ? "Cancels at period end"
      : STATUS_LABELS[subscription?.status || ""] || subscription?.status;

    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28, ease: "easeOut" }}
        className="rounded-2xl bg-card border border-border/60 shadow-luxe overflow-hidden"
      >
        <div className="px-5 pt-4 pb-1">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Your Plan
            </p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                isFree
                  ? "bg-cream-deep/80 border-border/40 text-ink-soft"
                  : "bg-gold-soft border-gold/15 text-gold-ink",
              )}
            >
              {plan?.display_name || "Free"}
            </span>
            {!isFree && (
              <div className="flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 rounded-full", statusDotColor)} />
                <span className="text-[11px] font-medium text-ink-soft">{statusLabel}</span>
              </div>
            )}
          </div>

          {showRenewal && (
            <p className="text-[12px] text-ink-soft">
              Renews on {formatDate(subscription?.current_period_end)}
            </p>
          )}

          {!isFree && !isCancelled && usage && !usageLoading && (
            <div className="space-y-2.5 pt-1">
              {usage.messages && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-ink-soft">Messages</span>
                    <span className="text-[11px] text-ink-muted">
                      {usage.messages.used} / {usage.messages.limit}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-cream-deep/80 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-gold to-[oklch(0.82_0.13_80)]"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, Math.round((usage.messages.used / usage.messages.limit) * 100))}%`,
                      }}
                      transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
              {usage.campaigns && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-ink-soft">Campaigns</span>
                    <span className="text-[11px] text-ink-muted">
                      {usage.campaigns.used} / {usage.campaigns.limit}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-cream-deep/80 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-gold to-[oklch(0.82_0.13_80)]"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, Math.round((usage.campaigns.used / usage.campaigns.limit) * 100))}%`,
                      }}
                      transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {!isFree && !isCancelled && usageLoading && (
            <div className="space-y-2.5 pt-1">
              <Skeleton className="h-3.5 w-full rounded-full" />
              <Skeleton className="h-3.5 w-full rounded-full" />
            </div>
          )}

          {isFree && (
            <>
              <p className="text-[13px] text-ink font-medium leading-snug">
                Upgrade to unlock unlimited campaigns & messaging
              </p>
              <ul className="space-y-1.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[12px] text-ink-soft">
                    <CheckCircle2 className="h-3.5 w-3.5 text-gold/60 shrink-0" strokeWidth={1.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push("/pricing")}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[oklch(0.78_0.13_80)] to-[oklch(0.68_0.13_78)] text-white text-[12px] font-medium px-5 h-9 shadow-[0_6px_18px_-8px_oklch(0.74_0.13_80/0.7)] hover:-translate-y-0.5 transition-transform"
              >
                Upgrade to Pro <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {isPastDue && (
            <div className="space-y-2 pt-1">
              <p className="text-[12px] text-error-text">
                Your payment method failed. Please update it to keep your plan active.
              </p>
              <button
                onClick={() => router.push("/pricing")}
                className="rounded-xl border border-border/60 bg-cream hover:bg-cream-hover text-ink text-[12px] font-medium px-3.5 h-8 transition-colors"
              >
                Update payment
              </button>
            </div>
          )}

          {isExpired && (
            <button
              onClick={() => router.push("/pricing")}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[oklch(0.78_0.13_80)] to-[oklch(0.68_0.13_78)] text-white text-[12px] font-medium px-5 h-9 shadow-[0_6px_18px_-8px_oklch(0.74_0.13_80/0.7)] hover:-translate-y-0.5 transition-transform"
            >
              Resubscribe <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}

          {!isFree && !isCancelled && !subscription?.cancel_at_period_end && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => router.push("/pricing")}
                className="rounded-xl border border-border/60 bg-cream hover:bg-cream-hover text-ink text-[12px] font-medium px-3.5 h-8 transition-colors"
              >
                Change plan
              </button>
              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogTrigger asChild>
                  <button className="rounded-xl border border-border/60 bg-cream hover:bg-cream-hover text-ink text-[12px] font-medium px-3.5 h-8 transition-colors">
                    Cancel plan
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel subscription?</DialogTitle>
                    <DialogDescription>
                      Your plan will remain active until the end of the current billing period.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <p className="text-sm font-medium">Why are you cancelling?</p>
                    <div className="space-y-2">
                      {CANCELLATION_REASONS.map((r) => (
                        <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="cancelReason"
                            value={r.value}
                            checked={cancelReason === r.value}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="accent-primary"
                          />
                          {r.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => { setConfirmOpen(false); setCancelReason(""); }}
                    >
                      Keep plan
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => cancelMutation.mutate(cancelReason || undefined)}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                      Confirm cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {subscription?.cancel_at_period_end && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
                <span className="text-[12px] text-ink-soft">
                  Plan will cancel at end of billing period
                </span>
              </div>
              <button
                onClick={() => resumeMutation.mutate()}
                disabled={resumeMutation.isPending}
                className="rounded-xl border border-border/60 bg-cream hover:bg-cream-hover text-ink text-[12px] font-medium px-3.5 h-8 transition-colors"
              >
                {resumeMutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                Resume
              </button>
            </div>
          )}
        </div>
      </motion.section>
    );
  }

  // --- Default variant (unchanged) ---
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Subscription</CardTitle>
          {plan && (
            <Badge variant="outline" className={planBadgeColor(subscription?.plan_key)}>
              {plan.display_name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {subscription && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusBadgeColor(subscription.status)}>
              {STATUS_LABELS[subscription.status] || subscription.status}
            </Badge>
            {subscription.cancel_at_period_end && (
              <span className="text-xs text-muted-foreground">Cancels at period end</span>
            )}
          </div>
        )}

        {showRenewal && (
          <p className="text-sm text-muted-foreground">
            Renews on {formatDate(subscription.current_period_end)}
          </p>
        )}

        {isFree && (
          <Button size="sm" onClick={() => router.push("/pricing")} aria-label="Upgrade subscription">
            Upgrade
          </Button>
        )}

        {isPastDue && (
          <div className="space-y-2">
            <p className="text-sm text-destructive">Your payment method failed. Please update it to keep your plan active.</p>
            <Button size="sm" variant="outline" onClick={() => router.push("/pricing")} aria-label="Update payment method">
              Update payment
            </Button>
          </div>
        )}

        {isExpired && (
          <Button size="sm" variant="outline" onClick={() => router.push("/pricing")} aria-label="Resubscribe">
            Resubscribe
          </Button>
        )}

        {!isFree && !isCancelled && !subscription?.cancel_at_period_end && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => router.push("/pricing")} aria-label="Change plan">
              Change plan
            </Button>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" aria-label="Cancel subscription">
                  Cancel plan
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel subscription?</DialogTitle>
                <DialogDescription>
                  Your plan will remain active until the end of the current billing period.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <p className="text-sm font-medium">Why are you cancelling?</p>
                <div className="space-y-2">
                  {CANCELLATION_REASONS.map((r) => (
                    <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="cancelReason"
                        value={r.value}
                        checked={cancelReason === r.value}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="accent-primary"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => { setConfirmOpen(false); setCancelReason(""); }}>
                  Keep plan
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => cancelMutation.mutate(cancelReason || undefined)}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  Confirm cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        )}

        {subscription?.cancel_at_period_end && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Plan will cancel at end of billing period
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => resumeMutation.mutate()}
              disabled={resumeMutation.isPending}
              aria-label="Resume subscription"
            >
              {resumeMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Resume
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
