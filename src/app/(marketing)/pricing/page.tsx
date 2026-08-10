"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { plansApi, subscriptionsApi, type Plan } from "@/lib/api";
import { useAuthStore } from "@/providers/auth-store-provider";
import { toast } from "sonner";

const faqs = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes. Upgrade or downgrade at any point. Changes take effect from the next billing cycle.",
  },
  {
    q: "What payment methods are accepted?",
    a: "UPI, debit/credit cards, net banking, and wallets — all via Razorpay.",
  },
  {
    q: "What happens to my campaigns if I downgrade?",
    a: "Existing campaigns remain accessible in read mode. You can reactivate them by upgrading again.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "The Free plan lets you explore core features. Paid plans come with a 30-day money-back guarantee.",
  },
];

function formatPrice(amountInPaise: number): string {
  const rupees = amountInPaise / 100;
  return rupees.toLocaleString("en-IN");
}

function PricingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="text-center">
        <Skeleton className="mx-auto h-3 w-28" />
        <Skeleton className="mx-auto mt-5 h-10 w-96 max-w-full" />
        <Skeleton className="mx-auto mt-4 h-4 w-48" />
      </div>
      <Skeleton className="mx-auto mt-8 h-10 w-40 rounded-full" />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-4 h-10 w-28" />
            <Skeleton className="mt-2 h-4 w-20" />
            <div className="mt-6 space-y-3 border-t border-border pt-6">
              {[0, 1, 2].map((j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
            <Skeleton className="mt-8 h-11 w-full rounded-xl" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function PricingError({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <Card className="mx-auto max-w-md p-6 text-center">
        <AlertCircle className="mx-auto size-10 text-destructive" />
        <p className="mt-3 font-semibold">Something went wrong</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </Card>
    </div>
  );
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradingKey, setUpgradingKey] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    isMountedRef.current = true;

    async function fetchPlans() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await plansApi.getPlans();
        if (!isMountedRef.current) return;
        const active = result
          .filter(
            (p) =>
              p.is_active !== false &&
              (p.target_role === "talent" || p.target_role === "both"),
          )
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        setPlans(active);
      } catch {
        if (isMountedRef.current) {
          setError("Failed to load plans. Please try again.");
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }

    fetchPlans();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleUpgrade = useCallback(
    async (plan: Plan) => {
      try {
        setUpgradingKey(plan.key);
        const interval = cycle === "yearly" ? "yearly" : "monthly";
        const result = await subscriptionsApi.upgrade({
          planKey: plan.key,
          interval,
        });
        if (result.checkout_url) {
          window.location.href = result.checkout_url;
        }
      } catch {
        toast.error("Failed to initiate upgrade. Please try again.");
        setUpgradingKey(null);
      }
    },
    [cycle],
  );

  if (isLoading) return <PricingSkeleton />;
  if (error) return <PricingError message={error} />;

  const currentPlanKey = user?.active_plan ?? null;

  return (
    <div className="min-h-screen bg-background font-display text-foreground">
      <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-primary">
          Plans &amp; Pricing
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-center text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Hire the best <span className="text-primary">creative</span> talent.
          <br className="hidden sm:block" /> Pay only for what{" "}
          <span className="text-primary">you need.</span>
        </h1>
        <p className="mt-4 text-center text-sm text-muted-foreground sm:text-base">
          No hidden fees. Cancel anytime.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-card/60 p-1">
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  cycle === c
                    ? "border border-primary/60 bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-start">
          {plans.map((plan) => {
            const price =
              cycle === "monthly" ? plan.monthly_price : plan.yearly_price;
            const suffix = plan.monthly_price === 0 ? "" : cycle === "monthly" ? "/mo" : "/yr";
            const note =
              plan.monthly_price === 0
                ? "forever"
                : cycle === "monthly"
                  ? "billed monthly"
                  : "billed yearly";
            const isCurrentPlan = hasHydrated && currentPlanKey === plan.key;
            const isPopular = plan.is_popular === true;

            return (
              <article
                key={plan.key}
                className={`card-surface relative flex flex-col rounded-2xl p-6 sm:p-7 ${
                  isPopular
                    ? "border-primary/70 shadow-[0_0_60px_-24px_var(--color-primary)] lg:-mt-4 lg:pb-9"
                    : ""
                }`}
              >
                {isPopular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    Most popular
                  </span>
                ) : null}

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {plan.display_name}
                </p>
                <p className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    ₹{formatPrice(price)}
                  </span>
                  <span className="pb-1.5 text-base text-muted-foreground">
                    {suffix}
                  </span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{note}</p>

                {plan.description && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                )}

                <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm sm:text-base">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                      <span className="min-w-0">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  {isCurrentPlan ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl py-3.5 text-sm font-bold sm:text-base"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : plan.monthly_price === 0 ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl py-3.5 text-sm font-bold sm:text-base"
                      asChild
                    >
                      <a href="/auth/signup">Get started free</a>
                    </Button>
                  ) : (
                    <Button
                      className={`w-full rounded-xl py-3.5 text-sm font-bold sm:text-base ${
                        isPopular
                          ? "shadow-[0_0_40px_-14px_var(--color-primary)]"
                          : ""
                      }`}
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgradingKey === plan.key}
                    >
                      {upgradingKey === plan.key ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : null}
                      Upgrade to {plan.display_name}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {plans.length === 0 && !isLoading && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            No plans available at the moment. Please check back later.
          </p>
        )}

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          30-day money-back guarantee on all paid plans
        </p>

        <section className="mt-10">
          <h2 className="sr-only">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="grid gap-5 md:grid-cols-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`faq-${i}`}
                className="card-surface rounded-2xl border-0 p-5 sm:p-6"
              >
                <AccordionTrigger className="text-left hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  <span className="flex items-start gap-4">
                    <HelpCircle className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span className="min-w-0 font-bold">{faq.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="ml-9 text-sm text-muted-foreground">{faq.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </div>
  );
}
