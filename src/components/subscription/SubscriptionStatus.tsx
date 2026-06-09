"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { subscriptionsApi, type SubscriptionWithPlan } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
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

function planBadgeColor(planKey: string | undefined) {
  if (planKey === "recruiter_pro") return "bg-amber-100 text-amber-800 border-amber-200";
  if (planKey === "recruiter_business") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
}

function statusBadgeColor(status: string | undefined) {
  if (status === "active" || status === "trialing") return "bg-green-100 text-green-800 border-green-200";
  if (status === "past_due") return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
}

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function SubscriptionStatus() {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    data,
    isLoading,
    error,
  } = useQuery<SubscriptionWithPlan>({
    queryKey: queryKeys.subscriptions.me(),
    queryFn: subscriptionsApi.getMySubscription,
  });

  const cancelMutation = useMutation({
    mutationFn: subscriptionsApi.cancelSubscription,
    onSuccess: () => {
      toast.success("Plan will cancel at end of billing period");
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.me() });
      setConfirmOpen(false);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to cancel subscription";
      toast.error(message);
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
        </CardContent>
      </Card>
    );
  }

  const subscription = data?.subscription;
  const plan = data?.plan;
  const isFree = subscription?.plan_key === "recruiter_free";
  const isCancelled = subscription?.status === "cancelled" || subscription?.status === "expired";
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
              {subscription.status === "active" ? "Active" :
                subscription.status === "trialing" ? "Trialing" :
                subscription.status === "past_due" ? "Past Due" :
                subscription.status === "cancelled" ? "Cancelled" :
                subscription.status === "expired" ? "Expired" : subscription.status}
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
          <Button size="sm" onClick={() => window.location.href = "/pricing"}>
            Upgrade
          </Button>
        )}

        {!isFree && !isCancelled && !subscription?.cancel_at_period_end && (
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Cancel plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel subscription?</DialogTitle>
                <DialogDescription>
                  Your plan will remain active until the end of the current billing period, then revert to Free.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                  Keep plan
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => cancelMutation.mutate()}
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Plan will cancel at end of billing period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
