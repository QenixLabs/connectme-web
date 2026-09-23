"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  ArrowLeft,
  CreditCard,
  FlaskConical,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient, plansApi, subscriptionsApi } from "@/lib/api";
import { toast } from "sonner";

type Status = "loading" | "ready" | "mismatch" | "done" | "success" | "cancelled" | "error";

export default function MockPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const subscriptionId = params.id as string;

  const [status, setStatus] = useState<Status>("loading");
  const [planKey, setPlanKey] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [processing, setProcessing] = useState<"pay" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!subscriptionId) {
        if (!cancelled) {
          setError("Missing subscription id.");
          setStatus("error");
        }
        return;
      }
      try {
        const [checkout, plans] = await Promise.all([
          subscriptionsApi.getCheckoutStatus(),
          plansApi.getPlans().catch(() => []),
        ]);
        if (cancelled) return;

        if (!checkout.pending) {
          setStatus("done");
          return;
        }
        if (
          checkout.razorpay_subscription_id &&
          checkout.razorpay_subscription_id !== subscriptionId
        ) {
          setStatus("mismatch");
          setPlanKey(checkout.plan_key ?? null);
          return;
        }
        setPlanKey(checkout.plan_key ?? null);
        const match = plans.find((p) => p.key === checkout.plan_key);
        setPlanName(match?.display_name ?? null);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        const backendMessage = (err as { backendMessage?: string })?.backendMessage;
        setError(backendMessage || "Failed to load checkout details. Are you logged in?");
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [subscriptionId]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      router.push("/pricing");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  async function simulate(event: "subscription.activated" | "subscription.cancelled") {
    setProcessing(event === "subscription.activated" ? "pay" : "cancel");
    try {
      await apiClient.post("/webhooks/simulate", {
        event,
        razorpaySubscriptionId: subscriptionId,
      });
      if (event === "subscription.activated") {
        setStatus("success");
        toast.success("Mock payment successful. Plan activated.");
        setCountdown(4);
      } else {
        setStatus("cancelled");
        toast.success("Mock checkout cancelled.");
      }
    } catch (err) {
      const backendMessage = (err as { backendMessage?: string })?.backendMessage;
      toast.error(backendMessage || "Simulation failed. Is the API running in dev mode?");
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="min-h-screen bg-background font-display text-foreground">
      <main className="mx-auto max-w-lg px-5 py-14 sm:px-8">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to pricing
        </Link>

        <div className="mt-6 flex items-center gap-2">
          <FlaskConical className="size-5 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight">Mock Checkout</h1>
          <Badge variant="outline" className="ml-1 border-dashed">
            dev only
          </Badge>
        </div>
        <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          Razorpay is mocked in development. No real money moves here — use the
          buttons below to simulate a payment outcome.
        </p>

        <Card className="card-surface mt-6 rounded-2xl p-6 sm:p-7">
          {status === "loading" && (
            <div className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          )}

          {status === "ready" && (
            <>
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold">
                    {planName ?? planKey ?? "Subscription"}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {subscriptionId}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  className="w-full rounded-xl py-3.5 text-sm font-bold sm:text-base"
                  onClick={() => simulate("subscription.activated")}
                  disabled={processing !== null}
                >
                  {processing === "pay" && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Pay now (simulate success)
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl py-3.5 text-sm font-bold sm:text-base"
                  onClick={() => simulate("subscription.cancelled")}
                  disabled={processing !== null}
                >
                  {processing === "cancel" && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Cancel payment (simulate failure)
                </Button>
              </div>
            </>
          )}

          {status === "success" && (
            <div className="py-4 text-center">
              <CheckCircle2 className="mx-auto size-12 text-green-500" />
              <p className="mt-4 text-lg font-bold">Payment successful</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your plan is now active.
                {countdown !== null && countdown > 0
                  ? ` Redirecting to pricing in ${countdown}s…`
                  : ""}
              </p>
              <Button className="mt-6 w-full rounded-xl" asChild>
                <Link href="/pricing">Back to pricing</Link>
              </Button>
            </div>
          )}

          {status === "cancelled" && (
            <div className="py-4 text-center">
              <XCircle className="mx-auto size-12 text-destructive" />
              <p className="mt-4 text-lg font-bold">Payment cancelled</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The pending checkout was discarded. You can start again from pricing.
              </p>
              <Button className="mt-6 w-full rounded-xl" variant="outline" asChild>
                <Link href="/pricing">Back to pricing</Link>
              </Button>
            </div>
          )}

          {status === "done" && (
            <div className="py-4 text-center">
              <CheckCircle2 className="mx-auto size-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-bold">Nothing to pay</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No pending checkout found for this subscription — it may have
                already been completed or cancelled.
              </p>
              <Button className="mt-6 w-full rounded-xl" variant="outline" asChild>
                <Link href="/pricing">Back to pricing</Link>
              </Button>
            </div>
          )}

          {status === "mismatch" && (
            <div className="py-4 text-center">
              <ShieldAlert className="mx-auto size-12 text-amber-500" />
              <p className="mt-4 text-lg font-bold">Different checkout pending</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This link is for{" "}
                <span className="font-mono text-xs">{subscriptionId}</span> but your
                pending checkout is for a newer subscription
                {planKey ? ` (${planKey})` : ""}.
              </p>
              <Button className="mt-6 w-full rounded-xl" variant="outline" asChild>
                <Link href="/pricing">Back to pricing</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="py-4 text-center">
              <XCircle className="mx-auto size-12 text-destructive" />
              <p className="mt-4 text-lg font-bold">Couldn&apos;t load checkout</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <Button className="mt-6 w-full rounded-xl" variant="outline" asChild>
                <Link href="/pricing">Back to pricing</Link>
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
