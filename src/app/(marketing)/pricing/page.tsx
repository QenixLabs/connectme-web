"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import {
  AlertCircle,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  Crown,
  Heart,
  HelpCircle,
  Loader2,
  LockKeyhole,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import rootinLogo from "@/assets/rootin-logo-orange.png";

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

function getPlanIcon(plan: Plan, index: number, total: number) {
  const key = plan.key.toLowerCase();
  const name = plan.display_name.toLowerCase();
  if (key.includes("free") || name.includes("free") || index === 0) return Send;
  if (plan.is_popular === true) return Crown;
  if (
    key.includes("agency") ||
    key.includes("team") ||
    key.includes("studio") ||
    name.includes("agency") ||
    index === total - 1
  )
    return Building2;
  return Crown;
}

function getPlanEyebrow(
  plan: Plan,
  targetRole: "recruiter" | "talent",
): string {
  if (plan.monthly_price === 0) return "Get started";
  if (plan.is_popular === true)
    return targetRole === "recruiter"
      ? "For professional recruiters"
      : "For serious creators";
  return targetRole === "recruiter"
    ? "For teams and studios"
    : "For pros and teams";
}

function getCtaLabel(plan: Plan): string {
  if (plan.monthly_price === 0) return "Start Free";
  if (plan.is_popular === true) return `Continue with ${plan.display_name}`;
  return `Choose ${plan.display_name}`;
}

function PricingSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-5 sm:px-8 lg:px-12">
        <section className="relative mt-8 grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.78fr)] lg:gap-12">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-6 h-5 w-48 rounded-full" />
            <Skeleton className="mt-4 h-14 w-full max-w-xl" />
            <Skeleton className="mt-4 h-6 w-full max-w-xl" />
          </div>
          <Skeleton className="aspect-[4/3] min-h-64 w-full rounded-[2rem] lg:aspect-[5/4]" />
        </section>
        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-5 lg:p-7">
              <Skeleton className="size-14 rounded-2xl" />
              <Skeleton className="mt-4 h-7 w-28" />
              <Skeleton className="mt-2 h-4 w-36" />
              <Skeleton className="mt-5 h-10 w-32" />
              <div className="mt-6 space-y-3">
                {[0, 1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="mt-7 h-12 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

function PricingError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-5 sm:px-8 lg:px-12">
        <Card className="mx-auto mt-16 max-w-md p-6 text-center">
          <AlertCircle className="mx-auto size-10 text-destructive" />
          <p className="mt-3 font-semibold">Something went wrong</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </Card>
      </div>
    </main>
  );
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradingKey, setUpgradingKey] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const targetRole = user?.role === "recruiter" ? "recruiter" : "talent";
  const isRecruiterView = targetRole === "recruiter";

  useEffect(() => {
    if (!hasHydrated) return;

    let cancelled = false;

    async function fetchPlans() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await plansApi.getPlans();
        if (cancelled) return;
        const active = result
          .filter(
            (p) =>
              p.is_active !== false &&
              (p.target_role === targetRole || p.target_role === "both"),
          )
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        setPlans(active);
      } catch {
        if (!cancelled) {
          setError("Failed to load plans. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchPlans();
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, targetRole]);

  const handleUpgrade = useCallback(
    async (plan: Plan) => {
      if (!user) {
        window.location.href = isRecruiterView
          ? "/auth/signup?role=recruiter"
          : "/auth/signup";
        return;
      }
      try {
        setUpgradingKey(plan.key);
        const interval = cycle === "yearly" ? "yearly" : "monthly";
        const result = await subscriptionsApi.upgrade({
          planKey: plan.key,
          interval,
        });
        const url = result.short_url || result.checkout_url;
        if (url) {
          window.location.href = url;
          return;
        }
        // Paid-to-paid change applied without a new checkout.
        toast.success("Plan updated successfully.");
        setUpgradingKey(null);
      } catch (err) {
        const backendMessage = (err as { backendMessage?: string })
          ?.backendMessage;
        toast.error(
          backendMessage || "Failed to initiate upgrade. Please try again.",
        );
        setUpgradingKey(null);
      }
    },
    [cycle, user, isRecruiterView],
  );

  if (isLoading) return <PricingSkeleton />;
  if (error) return <PricingError message={error} />;

  const currentPlanKey = user?.active_plan ?? null;
  const signupHref = isRecruiterView
    ? "/auth/signup?role=recruiter"
    : "/auth/signup";

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-5 sm:px-8 lg:px-12">
        <section className="relative mt-8 grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.78fr)] lg:gap-12">
          <div className="relative z-10">
            <div className="mb-7 flex items-center gap-3">
              <Image
                src={rootinLogo}
                alt="Rootin"
                priority
                className="h-auto w-[180px]"
              />
            </div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase text-primary">
              <Sparkles className="size-3.5" /> Find your perfect fit
            </p>
            <h1 className="max-w-xl font-display text-4xl font-extrabold leading-[1.03] sm:text-6xl">
              {isRecruiterView ? (
                <>
                  Choose how you{" "}
                  <span className="text-primary">want to recruit</span>
                </>
              ) : (
                <>
                  Choose how you{" "}
                  <span className="text-primary">want to shine</span>
                </>
              )}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {isRecruiterView
                ? "Flexible plans for individuals, teams and organizations. Find, connect and hire the right talent — faster."
                : "Flexible plans for creators at every stage. Showcase your work, get discovered, and unlock better opportunities."}
            </p>
          </div>

          <figure className="relative aspect-[4/3] min-h-64 overflow-hidden rounded-[2rem] lg:aspect-[5/4]">
            <Image
              src="/assets/recruiter-signup/hero-filmset.jpg"
              alt={
                isRecruiterView
                  ? "A director's chair on an active film production set"
                  : "Creative talent on a production set"
              }
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-6 pb-6 pt-20">
              <p className="max-w-48 font-script text-2xl leading-tight text-white">
                {isRecruiterView
                  ? "Great talent creates great work."
                  : "Great work finds great talent."}
              </p>
            </div>
          </figure>
        </section>

        <div className="mt-9 flex justify-center">
          <div
            className="inline-flex rounded-full border border-border bg-card p-1 shadow-card"
            role="group"
            aria-label="Billing period"
          >
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                aria-pressed={cycle === c}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  cycle === c
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-6" aria-label="Recruiting plans">
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 pt-5 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 sm:pt-5">
            {plans.map((plan, index) => {
              const Icon = getPlanIcon(plan, index, plans.length);
              const price =
                cycle === "monthly" ? plan.monthly_price : plan.yearly_price;
              const isFree = plan.monthly_price === 0;
              const cadence = isFree
                ? "forever"
                : cycle === "monthly"
                  ? "/ month · billed monthly"
                  : "/ year · billed yearly";
              const isCurrentPlan =
                hasHydrated && currentPlanKey === plan.key;
              const isPopular = plan.is_popular === true;
              const isUpgrading = upgradingKey === plan.key;

              return (
                <article
                  key={plan.key}
                  className={`relative flex min-w-[84vw] snap-center flex-col rounded-2xl border bg-card p-5 shadow-card transition-transform hover:-translate-y-1 sm:min-w-0 lg:p-7 ${
                    isPopular
                      ? "border-primary ring-1 ring-primary"
                      : "border-border"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow">
                      <Sparkles className="size-3.5" /> Most Popular
                    </div>
                  )}
                  <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-7" strokeWidth={2.2} />
                  </div>
                  <h2 className="font-display text-2xl font-extrabold">
                    {plan.display_name}
                  </h2>
                  <p className="mt-1 min-h-10 text-sm font-medium text-muted-foreground">
                    {getPlanEyebrow(plan, targetRole)}
                  </p>
                  <p className="mt-5 font-display text-4xl font-extrabold tracking-normal">
                    ₹{formatPrice(price)}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {cadence}
                  </p>
                  {plan.description ? (
                    <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">
                      {plan.description}
                    </p>
                  ) : null}
                  <ul className="mt-6 flex-1 space-y-3.5">
                    {(plan.features ?? []).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-foreground"
                      >
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    {isCurrentPlan ? (
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-12 w-full rounded-xl font-bold"
                        disabled
                      >
                        <Check /> Current Plan
                      </Button>
                    ) : isFree ? (
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-12 w-full rounded-xl font-bold"
                        asChild
                      >
                        <a href={signupHref}>{getCtaLabel(plan)}</a>
                      </Button>
                    ) : (
                      <Button
                        variant={isPopular ? "default" : "outline"}
                        size="lg"
                        className="h-12 w-full rounded-xl font-bold"
                        onClick={() => handleUpgrade(plan)}
                        disabled={isUpgrading}
                      >
                        {isUpgrading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        {getCtaLabel(plan)}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-1 text-center text-xs font-medium text-muted-foreground sm:hidden">
            Swipe to compare all plans
          </p>
        </section>

        {plans.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            No plans available at the moment. Please check back later.
          </p>
        )}

        <section
          className="mt-9 grid grid-cols-2 gap-x-5 gap-y-6 rounded-2xl bg-secondary p-5 sm:grid-cols-4"
          aria-label="Benefits"
        >
          {(
            [
              [ShieldCheck, "Verified talent network"],
              [Users, "Faster hiring"],
              [BarChart3, "Better opportunities"],
              [Heart, "Stronger creative teams"],
            ] as const
          ).map(([Icon, label]) => (
            <div key={label} className="flex min-w-0 items-center gap-3">
              <Icon
                className="size-7 shrink-0 text-primary"
                fill="currentColor"
              />
              <span className="text-sm font-semibold leading-tight">
                {label}
              </span>
            </div>
          ))}
        </section>

        <section className="mt-10" aria-label="Frequently asked questions">
          <Accordion
            type="single"
            collapsible
            className="grid gap-5 md:grid-cols-2"
          >
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`faq-${i}`}
                className="rounded-2xl border border-border bg-card p-5 sm:p-6"
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

        <footer className="mt-10 grid grid-cols-1 gap-4 border-t border-border py-6 text-sm font-medium text-muted-foreground sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <LockKeyhole className="size-4 text-primary" /> Change or upgrade
            your plan anytime.
          </p>
          <p className="flex items-center gap-2 sm:justify-end">
            <ShieldCheck className="size-4 text-primary" /> Secure & trusted
            payments <ChevronRight className="size-4" />
          </p>
        </footer>
      </div>
    </main>
  );
}
