"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Loader2,
  ReceiptText,
  RefreshCw,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRecruiterBillingSubscription,
  useRecruiterBillingUsage,
  useRecruiterBillingInvoices,
} from "@/hooks/use-recruiter-billing";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { toast } from "sonner";

function formatPlanName(planKey?: string | null): string {
  if (!planKey) return "Free";
  return planKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCurrency(amountInPaise: number): string {
  return `₹${Math.round(amountInPaise / 100)}`;
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPeriod(start?: string | null, end?: string | null): string {
  if (!start && !end) return "—";
  const s = start ? formatDate(start) : "?";
  const e = end ? formatDate(end) : "?";
  return `${s} – ${e}`;
}

function daysUntil(dateString?: string | null): number | null {
  if (!dateString) return null;
  const target = new Date(dateString);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-800 ${className ?? ""}`} />
  );
}

function BillingSkeleton() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-8 pt-7">
      <div>
        <SkeletonBlock className="h-8 w-32" />
        <SkeletonBlock className="mt-2 h-4 w-64" />
      </div>
      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0a1420] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-8 w-32" />
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <SkeletonBlock className="h-10 flex-1 rounded-xl" />
          <SkeletonBlock className="h-10 flex-1 rounded-xl" />
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0a1420] p-6">
        <SkeletonBlock className="mb-6 h-6 w-20" />
        <SkeletonBlock className="mb-4 h-16 rounded-xl" />
        <SkeletonBlock className="h-16 rounded-xl" />
      </div>
      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0a1420] p-6">
        <SkeletonBlock className="mb-6 h-6 w-20" />
        <SkeletonBlock className="mb-3 h-10 w-full" />
        <SkeletonBlock className="mb-3 h-10 w-full" />
        <SkeletonBlock className="h-10 w-full" />
      </div>
    </div>
  );
}

export default function RecruiterBillingPage() {
  const {
    data: subResponse,
    isLoading: loadingSub,
    error: errorSub,
  } = useRecruiterBillingSubscription();
  const {
    data: usage,
    isLoading: loadingUsage,
  } = useRecruiterBillingUsage();
  const {
    data: invoicesResponse,
    isLoading: loadingInvoices,
  } = useRecruiterBillingInvoices(1, 20);

  const [isUpgrading, setIsUpgrading] = useState(false);

  const subscription = subResponse?.subscription ?? null;
  const plan = subResponse?.plan ?? null;

  const handleUpgrade = async (planKey: string) => {
    try {
      setIsUpgrading(true);
      const result = await subscriptionsApi.upgrade({
        planKey,
        interval: "monthly",
      });
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch {
      toast.error("Failed to initiate upgrade. Please try again.");
      setIsUpgrading(false);
    }
  };

  if (loadingSub || loadingUsage || loadingInvoices) {
    return <BillingSkeleton />;
  }

  if (errorSub) {
    return (
      <div className="mx-auto max-w-xl px-5 pb-8 pt-7">
        <Card className="rounded-2xl border-slate-800 bg-[#0a1420] p-6 text-center">
          <p className="font-semibold text-white">Something went wrong</p>
          <p className="mt-1 text-sm text-slate-500">
            Failed to load billing data. Please try again.
          </p>
        </Card>
      </div>
    );
  }

  const isPaid = !!subscription?.plan_key;
  const status = subscription?.status;
  const isActive =
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "grace_period";
  const resetDate = subscription?.current_period_end;
  const daysLeft = daysUntil(resetDate);

  const invoices = invoicesResponse?.data ?? [];
  const messagesUsed = usage?.messages?.used ?? 0;
  const messagesLimit = usage?.messages?.limit ?? 1;
  const campaignsUsed = usage?.campaigns?.used ?? 0;
  const campaignsLimit = usage?.campaigns?.limit ?? 1;

  return (
    <div className="mx-auto max-w-xl px-5 pb-8 pt-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Billing
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your plan and payments
          </p>
        </div>
        <Button
          variant="outline"
          className="border-teal-700 text-teal-400 hover:bg-teal-950/40"
          onClick={() => {
            // Scroll to plan section or trigger upgrade flow
            const el = document.getElementById("subscription-card");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <ArrowUpRight className="mr-1 size-4" />
          Change Plan
        </Button>
      </div>

      {/* Subscription */}
      <section
        id="subscription-card"
        className="mt-6 rounded-2xl border border-slate-800 bg-[#0a1420] p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            Subscription
          </h2>
          <span className="rounded-full border border-teal-700 px-4 py-1.5 text-sm font-semibold text-teal-400">
            {isPaid
              ? (plan?.display_name ?? formatPlanName(subscription?.plan_key))
              : "Free"}
          </span>
        </div>

        <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-teal-950/60 px-4 py-2 text-sm font-semibold text-teal-400">
          <span className="size-2 rounded-full bg-teal-400" />
          {isActive ? "Active" : formatPlanName(status)}
        </span>

        {resetDate && isActive && (
          <p className="mt-5 text-sm text-slate-500">
            Renews on{" "}
            <span className="font-semibold text-teal-400">
              {formatDate(resetDate)}
              {daysLeft !== null && daysLeft > 0 && ` (${daysLeft} days)`}
            </span>
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="flex-1 border-teal-700 text-teal-400 hover:bg-teal-950/40"
            onClick={() => {
              // TODO: open plan selector or redirect to plans page
              toast.info("Plan selection coming soon.");
            }}
          >
            <RefreshCw className="mr-2 size-4" />
            Change plan
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-slate-700 text-slate-400 hover:bg-slate-800/40"
            onClick={() => {
              toast.info("Plan cancellation coming soon.");
            }}
          >
            <X className="mr-2 size-4" />
            Cancel plan
          </Button>
        </div>
      </section>

      {/* Usage */}
      <section className="mt-6 rounded-2xl border border-slate-800 bg-[#0a1420] p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-xl bg-teal-950/60 text-teal-400">
            <BarChart3 className="size-5" />
          </span>
          <h2 className="font-display text-xl font-bold tracking-tight text-white">
            Usage
          </h2>
        </div>

        <div className="mt-6 space-y-5">
          {/* Messages */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-base text-white">Messages</span>
              <span className="text-base text-slate-500">
                <span className="font-bold text-teal-400">{messagesUsed}</span>{" "}
                / {messagesLimit}
              </span>
            </div>
            <div className="mt-2">
              <Progress
                value={Math.min((messagesUsed / messagesLimit) * 100, 100)}
                className="h-2"
              />
            </div>
          </div>

          {/* Campaigns */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-base text-white">Campaigns</span>
              <span className="text-base text-slate-500">
                <span className="font-bold text-teal-400">{campaignsUsed}</span>{" "}
                / {campaignsLimit}
              </span>
            </div>
            <div className="mt-2">
              <Progress
                value={Math.min((campaignsUsed / campaignsLimit) * 100, 100)}
                className="h-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5 text-sm font-semibold text-teal-400">
          <span>View all usage details</span>
          <ChevronRight className="size-5" />
        </div>
      </section>

      {/* Invoices */}
      <section className="mt-6 rounded-2xl border border-slate-800 bg-[#0a1420] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-teal-950/60 text-teal-400">
              <ReceiptText className="size-5" />
            </span>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Invoices
            </h2>
          </div>
          {invoices.length > 0 && (
            <button className="inline-flex items-center gap-1 text-sm font-semibold text-teal-400">
              View all
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-800 bg-[#0a1420] p-4 text-center text-sm text-slate-500">
            No invoices yet. They will appear after your first payment.
          </div>
        ) : (
          <table className="mt-6 w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="pb-3 font-normal">Date</th>
                <th className="pb-3 font-normal">Period</th>
                <th className="pb-3 font-normal">Amount</th>
                <th className="pb-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id} className="border-t border-slate-800">
                  <td className="py-4 text-slate-500">
                    {formatDate(inv.created_at)}
                  </td>
                  <td className="py-4 text-slate-500">
                    {formatPeriod(inv.period_start, inv.period_end)}
                  </td>
                  <td className="py-4 text-white">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="py-4">
                    <Badge
                      variant={
                        inv.status === "paid"
                          ? "default"
                          : inv.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      {inv.status === "paid" ? "Paid" : inv.status === "pending" ? "Pending" : "Failed"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
