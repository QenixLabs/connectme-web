"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, X, ShieldCheck, Loader2 } from "lucide-react";
import { usePopup } from "@/hooks/use-popup";
import { plansApi, type PlanConfig } from "@/lib/api";
import { subscriptionsApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

function formatPrice(paise: number, annual: boolean): string {
  const monthly = paise / 100;
  if (monthly === 0) return "₹0";
  const value = annual ? Math.floor(monthly * 0.8) : monthly;
  return `₹${value.toLocaleString("en-IN")}`;
}

function periodText(paise: number, annual: boolean): string {
  if (paise === 0) return "forever";
  if (annual) {
    const yearly = Math.floor((paise / 100) * 0.8 * 12);
    return `billed ₹${yearly.toLocaleString("en-IN")} annually`;
  }
  return "billed monthly";
}

export default function PricingPage() {
  const router = useRouter();
  const popup = usePopup();
  const { user, isAuthenticated } = useAuthStore();
  const isRecruiter = user?.role === "recruiter";
  const isTalent = user?.role === "talent";
  const currentPlanKey = user?.active_plan;
  const [annual, setAnnual] = useState(false);

  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useQuery<PlanConfig[]>({
    queryKey: queryKeys.plans.public(),
    queryFn: plansApi.getPlans,
  });

  const filteredPlans = plans?.filter((plan) => {
    if (isTalent) return plan.key.startsWith("talent_");
    if (isRecruiter) return plan.key.startsWith("recruiter_");
    return true;
  });

  const handleUpgrade = async (planKey: string) => {
    try {
      const result = await subscriptionsApi.initiateUpgrade(planKey);
      if (result.shortUrl) {
        router.push(result.shortUrl);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to initiate upgrade";
      popup.show({ title: message, variant: "error" });
    }
  };

  const getCta = (plan: PlanConfig, isPopular: boolean) => {
    if (!isAuthenticated) {
      const signupPath = plan.key.startsWith("talent_")
        ? "/auth/talent/signup"
        : "/auth/recruiter/signup";
      return (
        <button
          className={`pricing-btn ${isPopular ? "pricing-btn-primary" : "pricing-btn-ghost"}`}
          onClick={() => router.push(signupPath)}
        >
          Get started free
        </button>
      );
    }

    const isTalentPlan = plan.key.startsWith("talent_");
    const isRecruiterPlan = plan.key.startsWith("recruiter_");

    if (isTalent && !isTalentPlan) {
      return (
        <button className="pricing-btn pricing-btn-ghost" disabled>
          Talents only
        </button>
      );
    }

    if (isRecruiter && !isRecruiterPlan) {
      return (
        <button className="pricing-btn pricing-btn-ghost" disabled>
          Recruiters only
        </button>
      );
    }

    if (currentPlanKey === plan.key) {
      return (
        <button className="pricing-btn pricing-btn-ghost" disabled>
          Current Plan
        </button>
      );
    }

    return (
      <button
        className={`pricing-btn ${isPopular ? "pricing-btn-primary" : plan.price === 0 ? "pricing-btn-ghost" : "pricing-btn-outline"}`}
        onClick={() => handleUpgrade(plan.key)}
      >
        {plan.price === 0
          ? "Get started free"
          : isPopular
            ? `Upgrade to ${plan.display_name}`
            : `Upgrade to ${plan.display_name}`}
      </button>
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
        .toggle-wrap { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 2.5rem; }
        .toggle-label { font-size: 13px; color: var(--color-ink-faded); font-weight: 400; }
        .toggle-label.active { color: var(--color-ink-deep); font-weight: 500; }
        .toggle { width: 40px; height: 22px; background: var(--color-msg-gold); border-radius: 11px; cursor: pointer; position: relative; border: none; outline: none; }
        .toggle-dot { width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: transform 0.2s; }
        .toggle.annual .toggle-dot { transform: translateX(18px); }
        .save-pill { background: color-mix(in oklab, var(--color-msg-gold) 13%, transparent); color: var(--color-gold-dark); font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.04em; }
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
        .pricing-btn { width: 100%; padding: 11px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: all 0.18s; text-align: center; }
        .pricing-btn-primary { background: var(--color-msg-gold); color: white; }
        .pricing-btn-primary:hover:not(:disabled) { background: var(--color-gold-light); }
        .pricing-btn-outline { background: transparent; color: var(--color-msg-gold); border: 1.5px solid var(--color-msg-gold); }
        .pricing-btn-outline:hover:not(:disabled) { background: color-mix(in oklab, var(--color-msg-gold) 7%, transparent); }
        .pricing-btn-ghost { background: transparent; color: var(--color-ink-faded); border: 1.5px solid var(--color-msg-border); }
        .pricing-btn-ghost:hover:not(:disabled) { background: var(--color-cream-hover); }
        .pricing-btn:disabled { opacity: 0.6; cursor: not-allowed; }
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

        {filteredPlans && filteredPlans.some((p) => p.price > 0) && (
          <div className="toggle-wrap">
            <span className={`toggle-label ${!annual ? "active" : ""}`}>Monthly</span>
            <button
              className={`toggle ${annual ? "annual" : ""}`}
              aria-label="Switch billing period"
              onClick={() => setAnnual((v) => !v)}
            >
              <div className="toggle-dot" />
            </button>
            <span className={`toggle-label ${annual ? "active" : ""}`}>Annual</span>
            <span className="save-pill" style={{ opacity: annual ? 1 : 0.35 }}>
              Save 20%
            </span>
          </div>
        )}

        {plansLoading && (
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
              const isPopular =
                plan.key === "recruiter_pro" || plan.key === "talent_verified";
              const priceDisplay = formatPrice(plan.price, annual);
              const period = periodText(plan.price, annual);

              return (
                <div
                  key={plan.key}
                  className={`pricing-card ${isPopular ? "featured" : ""}`}
                  role="listitem"
                >
                  {isPopular && <div className="card-badge">Most popular</div>}
                  <div className={`card-tier ${plan.price === 0 ? "muted" : ""}`}>
                    {plan.display_name}
                  </div>
                  <div className="card-price">
                    {priceDisplay}
                    {plan.price > 0 && <span>/mo</span>}
                  </div>
                  <div className="card-period">{period}</div>
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
      </div>
    </>
  );
}
