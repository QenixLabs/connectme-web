"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePopup } from "@/hooks/use-popup";
import { Loader2, AlertCircle, CheckCircle2, RefreshCcw } from "lucide-react";
import { subscriptionsApi, type SubscriptionWithPlan } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import { authStore } from "@/stores/auth-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function SubscriptionStatus() {
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

  if (isLoading) {
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

  if (error) {
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
