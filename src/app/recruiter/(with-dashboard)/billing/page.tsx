"use client";

import { useRouter } from "next/navigation";
import { useInvoices, useSubscriptionUsage } from "@/lib/api";
import { InvoiceTable } from "@/components/subscription/InvoiceTable";
import { UsageMeter } from "@/components/subscription/UsageMeter";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ReceiptText, BarChart3 } from "lucide-react";

export default function RecruiterBillingPage() {
  const router = useRouter();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { data: usage, isLoading: usageLoading } = useSubscriptionUsage();

  return (
    <div className="px-4 pt-4 pb-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Billing</h1>
          <p className="mt-0.5 text-xs text-slate-500">Manage your plan and payments</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-slate-200 text-sm"
          onClick={() => router.push("/pricing")}
        >
          <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
          Change Plan
        </Button>
      </div>

      <SubscriptionStatus />

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50">
            <BarChart3 className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">Usage</h2>
        </div>
        {usageLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : usage?.messages && usage?.campaigns ? (
          <div className="space-y-3">
            <UsageMeter label="Messages" used={usage.messages.used} limit={usage.messages.limit} />
            <UsageMeter label="Campaigns" used={usage.campaigns.used} limit={usage.campaigns.limit} />
          </div>
        ) : (
          <p className="text-sm text-slate-400">No usage data available.</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50">
            <ReceiptText className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">Invoices</h2>
        </div>
        {invoicesLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : (
          <InvoiceTable invoices={invoices?.data ?? []} />
        )}
      </div>
    </div>
  );
}