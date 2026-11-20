"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, ReceiptText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys, subscriptionsApi } from "@/lib/api";
import { getBillingPlanDetails } from "@/lib/billing";

function formatCurrency(amountInPaise: number): string {
  return `₹${Math.round(amountInPaise / 100)}`;
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProviderBillingPage() {
  const subscriptionQuery = useQuery({
    queryKey: queryKeys.subscriptions.me("provider"),
    queryFn: () => subscriptionsApi.getMySubscription("provider"),
  });
  const invoicesQuery = useQuery({
    queryKey: queryKeys.subscriptions.invoices(1, 20, "provider"),
    queryFn: () => subscriptionsApi.getInvoices(1, 20, "provider"),
  });

  if (subscriptionQuery.isLoading || invoicesQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    );
  }

  if (subscriptionQuery.isError || invoicesQuery.isError) {
    return (
      <Card className="mx-auto max-w-xl p-6 text-center">
        <h1 className="font-semibold">Could not load billing details</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Please try again later.
        </p>
      </Card>
    );
  }

  const plan = subscriptionQuery.data?.plan ?? null;
  const billingDetails = subscriptionQuery.data
    ? getBillingPlanDetails(subscriptionQuery.data, "Free Provider")
    : null;
  const effectivePlan = billingDetails?.plan ?? plan;
  const isFree = !(billingDetails?.isPaid ?? false);
  const status = billingDetails?.status ?? "active";
  const isActive = ["active", "trialing", "past_due", "grace_period"].includes(
    status,
  );
  const invoices = invoicesQuery.data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Billing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your provider plan and payments.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/pricing?role=provider">
            <ArrowUpRight className="mr-2 size-4" />
            View plans
          </Link>
        </Button>
      </header>

      <Card className="rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Current plan</p>
            <h2 className="mt-1 font-display text-2xl font-bold">
              {billingDetails?.planName ?? "Free Provider"}
            </h2>
            <Badge className="mt-3" variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : status.replace(/_/g, " ")}
            </Badge>
          </div>
          {billingDetails?.periodEnd && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              Renews {formatDate(billingDetails.periodEnd)}
            </p>
          )}
        </div>
        {effectivePlan?.features?.length ? (
          <ul className="mt-5 grid gap-2 border-t pt-5 text-sm sm:grid-cols-2">
            {effectivePlan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        ) : null}
        <Button asChild className="mt-5">
          <Link href="/pricing?role=provider">
            {isFree ? "Explore paid plans" : "Change plan"}
          </Link>
        </Button>
      </Card>

      <Card className="rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <ReceiptText className="size-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Invoices</h2>
        </div>
        {invoices.length === 0 ? (
          <p className="mt-4 rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
            No invoices yet. They will appear after your first payment.
          </p>
        ) : (
          <div className="mt-4 divide-y">
            {invoices.map((invoice) => (
              <div
                key={invoice._id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <span>{formatDate(invoice.created_at)}</span>
                <span>{formatCurrency(invoice.amount)}</span>
                <Badge
                  variant={
                    invoice.status === "paid"
                      ? "default"
                      : invoice.status === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {invoice.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
