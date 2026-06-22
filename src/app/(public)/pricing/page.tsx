"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, ShieldCheck } from "lucide-react";
import { usePopup } from "@/hooks/use-popup";
import { plansApi, type PlanConfig } from "@/lib/api";
import { subscriptionsApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FAQS = [
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

function formatPrice(paise: number): string {
  if (paise === 0) return "₹0";
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default function PricingPage() {
  const router = useRouter();
  const popup = usePopup();
  const { user, isAuthenticated } = useAuthStore();
  const role = user?.role ?? null;
  const currentPlanKey = user?.active_plan;
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useQuery<PlanConfig[]>({
    queryKey: queryKeys.plans.public(),
    queryFn: plansApi.getPlans,
  });

  const {
    data: checkoutStatus,
    isLoading: isCheckoutLoading,
  } = useQuery<Awaited<ReturnType<typeof subscriptionsApi.getCheckoutStatus>>>({
    queryKey: queryKeys.subscriptions.checkoutStatus(),
    queryFn: subscriptionsApi.getCheckoutStatus,
    enabled: isAuthenticated,
  });

  const isLoading = plansLoading || isCheckoutLoading;

  const [planToSwitch, setPlanToSwitch] = useState<string | null>(null);

  const filteredPlans = plans?.filter((plan) => {
    if (role === "talent") return plan.target_role === "talent" || plan.target_role === "both";
    if (role === "recruiter") return plan.target_role === "recruiter" || plan.target_role === "both";
    return true;
  });

  const handleUpgrade = async (planKey: string) => {
    try {
      const result = await subscriptionsApi.initiateUpgrade(planKey, billingInterval);
      if (result.short_url) {
        if (result.short_url.startsWith("http")) {
          window.open(result.short_url, "_self");
        } else {
          router.push(result.short_url);
        }
      }
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { message?: string } } }).response;
      const message = response?.data?.message || "Failed to initiate upgrade";
      if (response?.status !== 429) {
        popup.show({ title: message, variant: "error" });
      }
    }
  };

  const getCta = (plan: PlanConfig, isPopular: boolean) => {
    if (!isAuthenticated) {
      const signupPath = role === "recruiter"
        ? "/auth/recruiter/signup"
        : "/auth/talent/signup";
      return (
        <Button
          variant={isPopular ? "default" : "ghost"}
          className="w-full"
          onClick={() => router.push(signupPath)}
        >
          Get started free
        </Button>
      );
    }

    if (currentPlanKey === plan.key || currentPlanKey === plan.family_key) {
      return (
        <Button variant="ghost" className="w-full" disabled>
          Current Plan
        </Button>
      );
    }

    if (checkoutStatus?.pending && checkoutStatus.plan_key === plan.key) {
      return (
        <Button
          variant="default"
          className="w-full"
          onClick={() => {
            if (checkoutStatus.short_url) {
              window.location.href = checkoutStatus.short_url;
            }
          }}
          disabled={!checkoutStatus.short_url}
        >
          Resume your upgrade
        </Button>
      );
    }

    if (checkoutStatus?.pending && checkoutStatus.plan_key !== plan.key) {
      return (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setPlanToSwitch(plan.key)}
        >
          Switch to this plan
        </Button>
      );
    }

    const currentPrice = billingInterval === "monthly" ? plan.monthly_price : plan.yearly_price;
    const isFree = currentPrice === 0;

    return (
      <Button
        variant={isPopular ? "default" : isFree ? "ghost" : "outline"}
        className="w-full"
        onClick={() => handleUpgrade(plan.key)}
      >
        {isFree
          ? "Get started free"
          : `Upgrade to ${plan.display_name}`}
      </Button>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
        .pricing-root { font-family: 'DM Sans', sans-serif; background: var(--color-cream-pale); padding: 3rem 1.5rem 4rem; color: var(--color-ink-deep); }
        .pricing-eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-gold-light); font-weight: 500; text-align: center; margin-bottom: 0.75rem; }
        .pricing-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 600; text-align: center; color: var(--color-ink-deep); margin: 0 0 0.5rem; line-height: 1.2; }
        .pricing-sub { text-align: center; font-size: 15px; color: var(--color-ink-faded); font-weight: 300; margin: 0 0 3rem; }
        .pricing-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; max-width: 860px; margin: 0 auto 2rem; }
        .pricing-card { background: white; border: 1px solid var(--color-msg-border); border-radius: 16px; padding: 1.75rem 1.5rem 1.5rem; position: relative; display: flex; flex-direction: column; }
        .pricing-card.featured { border: 2px solid var(--color-msg-gold); background: var(--color-cream-light); }
        .card-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: var(--color-msg-gold); color: white; font-size: 11px; font-weight: 500; letter-spacing: 0.06em; padding: 4px 14px; border-radius: 20px; white-space: nowrap; }
        .card-tier { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-gold-light); font-weight: 500; margin-bottom: 0.4rem; }
        .card-tier.muted { color: var(--color-stone); }
        .card-price { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 600; color: var(--color-ink-deep); line-height: 1; margin-bottom: 0.2rem; }
        .card-price span { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 400; color: var(--color-ink-faded); }
        .card-period { font-size: 13px; color: var(--color-stone); margin-bottom: 1.25rem; }
        .card-divider { height: 1px; background: var(--color-bg-warm); margin: 0 0 1.25rem; }
        .feature-list { list-style: none; padding: 0; margin: 0 0 1.5rem; flex: 1; }
        .feature-list li { display: flex; align-items: flex-start; gap: 9px; font-size: 13.5px; color: var(--color-ink-warm); line-height: 1.5; margin-bottom: 10px; }
        .feature-list li .icon { color: var(--color-msg-gold); font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .feature-list li .icon.dim { color: var(--color-warm-gray); }
        .faq-strip { max-width: 860px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .faq-item { background: white; border: 1px solid var(--color-msg-border); border-radius: 12px; padding: 1rem 1.25rem; }
        .faq-q { font-size: 13px; font-weight: 500; color: var(--color-ink-deep); margin-bottom: 0.3rem; }
        .faq-a { font-size: 12.5px; color: var(--color-ink-faded); line-height: 1.55; }
        .guarantee { text-align: center; margin-top: 2rem; font-size: 13px; color: var(--color-stone); display: flex; align-items: center; justify-content: center; gap: 6px; }
        @media (max-width: 600px) { .faq-strip { grid-template-columns: 1fr; } .pricing-cards { grid-template-columns: 1fr; } .pricing-title { font-size: 28px; } }
      `}</style>

      <div className="pricing-root">
        <p className="pricing-eyebrow">Plans &amp; Pricing</p>
        <h1 className="pricing-title">
          Hire the best creative talent.
          <br />
          Pay only for what you need.
        </h1>
        <p className="pricing-sub">No hidden fees. Cancel anytime.</p>

        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center rounded-full border border-muted-foreground/20 p-0.5 bg-white shadow-sm">
            <button
              type="button"
              className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                billingInterval === "monthly"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setBillingInterval("monthly")}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                billingInterval === "yearly"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setBillingInterval("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="pricing-cards">
            {[1, 2, 3].map((i) => (
              <div key={i} className="pricing-card">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-24 mb-1" />
                <Skeleton className="h-3 w-28 mb-6" />
                <div className="card-divider" />
                <div className="space-y-3 mb-6">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        )}

        {plansError && (
          <div className="text-center space-y-3">
            <p style={{ color: "var(--color-error)" }}>Failed to load plans. Please try again later.</p>
            <Button variant="outline" onClick={() => refetchPlans()}>
              Retry
            </Button>
          </div>
        )}

        {filteredPlans && (
          <div className="pricing-cards" role="list">
            {filteredPlans.map((plan) => {
              const isPopular = plan.is_popular === true;
              const currentPrice = billingInterval === "monthly" ? plan.monthly_price : plan.yearly_price;
              const otherPrice = billingInterval === "monthly" ? plan.yearly_price : plan.monthly_price;
              const isFree = currentPrice === 0;

              return (
                <div
                  key={plan.key}
                  className={`pricing-card ${isPopular ? "featured" : ""}`}
                  role="listitem"
                >
                  {isPopular && <div className="card-badge">Most popular</div>}
                  <div className={`card-tier ${isFree ? "muted" : ""}`}>
                    {plan.display_name}
                  </div>
                  <div className="card-price">
                    {formatPrice(currentPrice)}
                    {!isFree && (
                      <span>/{billingInterval === "yearly" ? "yr" : "mo"}</span>
                    )}
                  </div>
                  <div className="card-period">
                    {isFree
                      ? "forever"
                      : billingInterval === "yearly"
                        ? `billed annually — save ${Math.round((1 - plan.yearly_price / (plan.monthly_price * 12)) * 100)}%`
                        : "billed monthly"}
                    {otherPrice > 0 && billingInterval === "yearly" && (
                      <span className="block text-[11px] text-muted-foreground/70">
                        {formatPrice(plan.monthly_price)}/mo if paid monthly
                      </span>
                    )}
                  </div>
                  <div className="card-divider" />
                  <ul className="feature-list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <Check
                          className="icon"
                          size={16}
                          strokeWidth={2.5}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {getCta(plan, isPopular)}
                </div>
              );
            })}
          </div>
        )}

        <div className="guarantee">
          <ShieldCheck size={16} color="var(--color-msg-gold)" />
          30-day money-back guarantee on all paid plans
        </div>

        <div style={{ height: "2.5rem" }} />

        <div className="faq-strip">
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q">{faq.q}</div>
              <div className="faq-a">{faq.a}</div>
            </div>
          ))}
        </div>

        <Dialog open={!!planToSwitch} onOpenChange={(open) => { if (!open) setPlanToSwitch(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Switch plan?</DialogTitle>
              <DialogDescription>
                You have an incomplete checkout for another plan. Continuing will cancel it and start this one.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPlanToSwitch(null)}>
                Keep current checkout
              </Button>
              <Button
                onClick={async () => {
                  if (planToSwitch) {
                    await handleUpgrade(planToSwitch);
                    setPlanToSwitch(null);
                  }
                }}
              >
                Switch to this plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
