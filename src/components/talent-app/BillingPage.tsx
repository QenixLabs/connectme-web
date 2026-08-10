"use client";

import { useEffect, useState, useRef } from "react";
import {
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  HelpCircle,
  ImageIcon,
  Info,
  Lock,
  Star,
  Video,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  subscriptionsApi,
  plansApi,
  type Subscription,
  type PlanConfig,
  type UsageResponse,
  type Invoice,
} from "@/lib/api";
import { toast } from "sonner";

interface BillingData {
  subscription: Subscription | null;
  plan: PlanConfig | null;
  usage: UsageResponse | null;
  invoices: Invoice[];
  plans: PlanConfig[];
  isLoading: boolean;
  error: string | null;
}

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

function daysUntil(dateString?: string | null): number | null {
  if (!dateString) return null;
  const target = new Date(dateString);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function UsageRing({ percent }: { percent: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="relative size-[110px]">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="7"
          className="stroke-secondary"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${(c * clamped) / 100} ${c}`}
          className="stroke-primary"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

function BillingSkeleton() {
  return (
    <div className="mx-auto max-w-[900px] space-y-6 px-5 pb-8 pt-7">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <Card className="rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="size-[110px] rounded-full" />
        </div>
      </Card>
      <Skeleton className="h-5 w-20" />
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}

function BillingError({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-[900px] px-5 pb-8 pt-7">
      <Card className="rounded-2xl p-6 text-center">
        <AlertCircle className="mx-auto size-10 text-destructive" />
        <p className="mt-3 font-semibold">Something went wrong</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </Card>
    </div>
  );
}

export function BillingPage() {
  const [data, setData] = useState<BillingData>({
    subscription: null,
    plan: null,
    usage: null,
    invoices: [],
    plans: [],
    isLoading: true,
    error: null,
  });

  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    async function fetchData() {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const [subResult, usageResult, invoicesResult, plansResult] =
          await Promise.allSettled([
            subscriptionsApi.getMySubscription(),
            subscriptionsApi.getUsage(),
            subscriptionsApi.getInvoices(1, 20),
            plansApi.getPlans(),
          ]);

        if (!isMountedRef.current) return;

        setData({
          subscription:
            subResult.status === "fulfilled"
              ? subResult.value.subscription
              : null,
          plan:
            subResult.status === "fulfilled" ? subResult.value.plan : null,
          usage:
            usageResult.status === "fulfilled" ? usageResult.value : null,
          invoices:
            invoicesResult.status === "fulfilled"
              ? invoicesResult.value.data
              : [],
          plans:
            plansResult.status === "fulfilled" ? plansResult.value : [],
          isLoading: false,
          error:
            subResult.status === "rejected"
              ? "Failed to load billing data. Please try again."
              : null,
        });
      } catch {
        if (isMountedRef.current) {
          setData((prev) => ({
            ...prev,
            isLoading: false,
            error: "An unexpected error occurred.",
          }));
        }
      }
    }

    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  const handleUpdatePaymentMethod = async () => {
    try {
      setIsUpdatingPayment(true);
      const result = await subscriptionsApi.updatePaymentMethod({
        return_url: window.location.href,
      });
      if (result.payment_url) {
        window.location.href = result.payment_url;
      }
    } catch {
      toast.error("Failed to open payment method update. Please try again.");
      setIsUpdatingPayment(false);
    }
  };

  const handleDownloadInvoice = (pdfUrl?: string | null) => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    } else {
      toast.error("Invoice PDF not available.");
    }
  };

  if (data.isLoading) {
    return <BillingSkeleton />;
  }

  if (data.error) {
    return <BillingError message={data.error} />;
  }

  const isPaid = !!data.subscription?.plan_key;
  const status = data.subscription?.status;
  const isActive =
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "grace_period";
  const resetDate = data.subscription?.current_period_end;
  const daysLeft = daysUntil(resetDate);

  const usagePercent =
    data.usage?.media
      ? Math.round(
          ((data.usage.media.images.used + data.usage.media.videos.used) /
            Math.max(
              1,
              data.usage.media.images.limit + data.usage.media.videos.limit,
            )) *
            100,
        )
      : 0;

  const upgradePlan = data.plans.find(
    (p) =>
      p.target_role === "talent" &&
      p.monthly_price > 0 &&
      p.is_active !== false,
  );

  const perks = [
    { icon: ImageIcon, tone: "text-primary bg-primary/10" },
    { icon: Video, tone: "text-purple bg-purple/10" },
    { icon: Star, tone: "text-amber-tag bg-amber-tag/10" },
    { icon: BarChart3, tone: "text-blue bg-blue/10" },
  ];

  return (
    <div className="mx-auto max-w-[900px] px-5 pb-8 pt-7">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Billing
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Manage your plan, usage and payments
      </p>

      {/* Current Plan */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-primary">Current Plan</p>
            <h2 className="mt-1.5 font-display text-3xl font-bold tracking-tight">
              {isPaid ? (data.plan?.display_name ?? formatPlanName(data.subscription?.plan_key)) : "Free Plan"}
            </h2>
            {resetDate && isActive && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                {daysLeft !== null && daysLeft > 0
                  ? `Resets on ${formatDate(resetDate)}`
                  : `Expired on ${formatDate(resetDate)}`}
                <Info className="size-4" />
              </p>
            )}
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium">
              <span
                className={`size-2 rounded-full ${
                  isActive ? "bg-success" : "bg-muted-foreground"
                }`}
              />
              {isActive ? "Active" : formatPlanName(status)}
            </span>
          </div>

          <div className="flex shrink-0 flex-col items-center">
            <UsageRing percent={usagePercent} />
            <p className="mt-2 text-sm text-muted-foreground">
              of upload quota used
            </p>
          </div>
        </div>

        {/* Upgrade to Pro */}
        {upgradePlan && !isPaid && (
          <div className="mt-5 border-t border-border pt-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-[200px] flex-1">
                <p className="font-semibold text-primary">
                  Upgrade to {upgradePlan.display_name}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {upgradePlan.description ||
                    "Unlock premium features and more visibility."}
                </p>
                <div className="mt-4 flex gap-3">
                  {perks.map((p, i) => (
                    <span
                      key={i}
                      className={`flex size-10 items-center justify-center rounded-lg ${p.tone}`}
                    >
                      <p.icon className="size-5" />
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  className="rounded-lg bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground hover:opacity-90"
                  onClick={() => handleUpgrade(upgradePlan.key)}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : null}
                  Upgrade to {upgradePlan.display_name}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(upgradePlan.monthly_price)} / month
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Usage */}
      <div className="mt-7 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Usage</h2>
      </div>

      <div className="mt-3 space-y-3">
        {/* Images */}
        <Card className="flex items-center gap-4 rounded-xl p-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ImageIcon className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold">Images</p>
              <span className="text-sm text-muted-foreground">
                {data.usage?.media
                  ? `${data.usage.media.images.limit - data.usage.media.images.used} remaining`
                  : "—"}
              </span>
            </div>
            <p className="mt-0.5 text-sm">
              <span className="text-primary">
                {data.usage?.media?.images.used ?? 0} used
              </span>{" "}
              <span className="text-muted-foreground">
                of {data.usage?.media?.images.limit ?? 0}
              </span>
            </p>
            <Progress
              value={
                data.usage?.media
                  ? (data.usage.media.images.used / data.usage.media.images.limit) * 100
                  : 0
              }
              className="mt-2 h-1.5"
            />
            {daysLeft !== null && daysLeft > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                Resets in {daysLeft} days
              </p>
            )}
          </div>
        </Card>

        {/* Videos */}
        <Card className="flex items-center gap-4 rounded-xl p-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-purple/10 text-purple">
            <Video className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold">Videos</p>
              <span className="text-sm text-muted-foreground">
                {data.usage?.media
                  ? `${data.usage.media.videos.limit - data.usage.media.videos.used} remaining`
                  : "—"}
              </span>
            </div>
            <p className="mt-0.5 text-sm">
              <span className="text-purple">
                {data.usage?.media?.videos.used ?? 0} used
              </span>{" "}
              <span className="text-muted-foreground">
                of {data.usage?.media?.videos.limit ?? 0}
              </span>
            </p>
            <Progress
              value={
                data.usage?.media
                  ? (data.usage.media.videos.used / data.usage.media.videos.limit) * 100
                  : 0
              }
              className="mt-2 h-1.5"
            />
            {data.usage?.media?.videos.used === data.usage?.media?.videos.limit && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Lock className="size-4" />
                Upgrade to upload more videos
              </p>
            )}
          </div>
        </Card>

        {/* Why upgrade */}
        {!isPaid && upgradePlan && (
          <Card className="flex flex-wrap items-center gap-4 rounded-xl p-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Star className="size-6" />
            </div>
            <div className="min-w-[180px] flex-1">
              <p className="font-semibold">Why upgrade to {upgradePlan.display_name}?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Grow your profile and get discovered by more opportunities.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-lg border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
              onClick={() => handleUpgrade(upgradePlan.key)}
              disabled={isUpgrading}
            >
              See Benefits
            </Button>
          </Card>
        )}
      </div>

      {/* Payment Method */}
      <h2 className="mt-7 font-display text-xl font-bold">Payment Method</h2>
      <Card className="mt-3 flex items-center gap-4 rounded-xl p-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <CreditCard className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {data.subscription?.razorpay_customer_id
              ? "Payment method on file"
              : "No payment method added"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.subscription?.razorpay_customer_id
              ? "Update your card details"
              : "Add a card to subscribe to a paid plan"}
          </p>
        </div>
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary"
          onClick={handleUpdatePaymentMethod}
          disabled={isUpdatingPayment}
        >
          {isUpdatingPayment ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              {data.subscription?.razorpay_customer_id ? "Update" : "Add Card"}
              <ExternalLink className="size-4" />
            </>
          )}
        </Button>
      </Card>

      {/* Billing History */}
      <h2 className="mt-7 font-display text-xl font-bold">Billing History</h2>
      {data.invoices.length === 0 ? (
        <Card className="mt-3 flex items-center gap-4 rounded-xl p-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <FileText className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">No invoices yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your invoices will appear here after your first payment.
            </p>
          </div>
        </Card>
      ) : (
        <div className="mt-3 space-y-2">
          {data.invoices.map((invoice) => (
            <Card
              key={invoice._id}
              className="flex items-center gap-4 rounded-xl p-4"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {formatCurrency(invoice.amount)}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatDate(invoice.created_at)}
                  {invoice.invoice_number && ` • ${invoice.invoice_number}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    invoice.status === "paid"
                      ? "default"
                      : invoice.status === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                  className="rounded-full px-2 py-0.5 text-xs"
                >
                  {invoice.status === "paid" ? (
                    <CheckCircle className="mr-1 size-3" />
                  ) : null}
                  {invoice.status}
                </Badge>
                {invoice.pdf_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0"
                    onClick={() => handleDownloadInvoice(invoice.pdf_url)}
                  >
                    <Download className="size-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Help */}
      <h2 className="mt-7 font-display text-xl font-bold">Need Help?</h2>
      <Card
        className="mt-3 flex cursor-pointer items-center gap-4 rounded-xl p-4 transition-colors hover:bg-accent/50"
        onClick={() => setShowHelpDialog(true)}
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary">
          <HelpCircle className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Visit our Help Center</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Find answers to common billing questions
          </p>
        </div>
      </Card>

      {/* Help Center Coming Soon Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Help Center
            </DialogTitle>
            <DialogDescription>
              Our help center is coming soon. We&apos;re working on it!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <HelpCircle className="size-8 text-primary" />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              We&apos;re building a comprehensive help center with answers to
              all your billing and account questions. Stay tuned!
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => setShowHelpDialog(false)}
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
