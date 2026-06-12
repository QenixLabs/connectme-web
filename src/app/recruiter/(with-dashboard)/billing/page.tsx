"use client";

import { useInvoices, useSubscriptionUsage } from "@/lib/api";
import { InvoiceTable } from "@/components/subscription/InvoiceTable";
import { UsageMeter } from "@/components/subscription/UsageMeter";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { Loader2 } from "lucide-react";

export default function RecruiterBillingPage() {
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { data: usage, isLoading: usageLoading } = useSubscriptionUsage();

  return (
    <div className="px-4 pt-4 pb-6 space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-text-primary">Billing</h1>
      <SubscriptionStatus />

      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Usage</h2>
        {usageLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : usage?.messages && usage?.campaigns ? (
          <div className="space-y-3">
            <UsageMeter label="Messages" used={usage.messages.used} limit={usage.messages.limit} />
            <UsageMeter label="Campaigns" used={usage.campaigns.used} limit={usage.campaigns.limit} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No usage data available.</p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Invoices</h2>
        {invoicesLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <InvoiceTable invoices={invoices?.data ?? []} />
        )}
      </div>
    </div>
  );
}
