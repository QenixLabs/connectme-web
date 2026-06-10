"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { usePopup } from "@/hooks/use-popup";
import { plansApi, type PlanConfig } from "@/lib/api";
import { subscriptionsApi } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_CARDS = [1, 2, 3];
const SKELETON_FEATURES = [1, 2, 3, 4];

export default function PricingPage() {
  const router = useRouter();
  const popup = usePopup();
  const { user, isAuthenticated } = useAuthStore();
  const isRecruiter = user?.role === "recruiter";
  const isTalent = user?.role === "talent";
  const currentPlanKey = user?.active_plan;

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

  const getCta = (plan: PlanConfig) => {
    if (!isAuthenticated) {
      const signupPath = plan.key.startsWith("talent_")
        ? "/auth/talent/signup"
        : "/auth/recruiter/signup";
      return (
        <Button
          className="w-full"
          onClick={() => router.push(signupPath)}
          aria-label={`Get started with ${plan.display_name} plan`}
        >
          Get Started
        </Button>
      );
    }

    const isTalentPlan = plan.key.startsWith("talent_");
    const isRecruiterPlan = plan.key.startsWith("recruiter_");

    if (isTalent && !isTalentPlan) {
      return (
        <Button className="w-full" disabled aria-label="Talents only">
          Talents only
        </Button>
      );
    }

    if (isRecruiter && !isRecruiterPlan) {
      return (
        <Button className="w-full" disabled aria-label="Recruiters only">
          Recruiters only
        </Button>
      );
    }

    if (currentPlanKey === plan.key) {
      return (
        <Button className="w-full" disabled variant="secondary" aria-label="Current plan">
          Current Plan
        </Button>
      );
    }

    return (
      <Button
        className="w-full"
        onClick={() => handleUpgrade(plan.key)}
        aria-label={`Upgrade to ${plan.display_name} plan`}
      >
        Upgrade
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-page py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose the plan that fits your hiring needs. No hidden fees.
          </p>
        </div>

        {plansLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SKELETON_CARDS.map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-20 mt-2" />
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {SKELETON_FEATURES.map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {plansError && (
          <div className="text-center space-y-3">
            <p className="text-destructive">Failed to load plans. Please try again later.</p>
            <Button variant="outline" onClick={() => refetchPlans()}>Retry</Button>
          </div>
        )}

        {filteredPlans && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
            {filteredPlans.map((plan) => {
              const isPopular = plan.key === "recruiter_pro" || plan.key === "talent_verified";
              const priceDisplay = plan.price === 0
                ? "Free"
                : `₹${(plan.price / 100).toLocaleString("en-IN")}/mo`;

              return (
                <Card
                  key={plan.key}
                  className={`flex flex-col relative ${isPopular ? "border-amber-400 ring-1 ring-amber-400" : ""}`}
                  role="listitem"
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white border-0">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground">
                      {priceDisplay}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {getCta(plan)}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
