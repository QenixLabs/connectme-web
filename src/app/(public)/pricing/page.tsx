"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { plansApi, type PlanConfig } from "@/lib/api";
import { subscriptionsApi } from "@/lib/api";
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

export default function PricingPage() {
  const { user, isAuthenticated } = useAuthStore();
  const isRecruiter = user?.role === "recruiter";
  const currentPlanKey = user?.active_plan;

  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery<PlanConfig[]>({
    queryKey: ["plans", "public"],
    queryFn: plansApi.getPlans,
  });

  const {
    data: subscriptionData,
    isLoading: subLoading,
  } = useQuery({
    queryKey: ["subscriptions", "me"],
    queryFn: subscriptionsApi.getMySubscription,
    enabled: isAuthenticated && isRecruiter,
  });

  const handleUpgrade = async (planKey: string) => {
    try {
      const result = await subscriptionsApi.initiateUpgrade(planKey);
      if (result.shortUrl) {
        window.location.href = result.shortUrl;
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to initiate upgrade";
      alert(message);
    }
  };

  const getCta = (plan: PlanConfig) => {
    if (!isAuthenticated) {
      return (
        <Button className="w-full" onClick={() => window.location.href = "/auth/recruiter/signup"}>
          Get Started
        </Button>
      );
    }

    if (!isRecruiter) {
      return (
        <Button className="w-full" disabled>
          Recruiters only
        </Button>
      );
    }

    if (currentPlanKey === plan.key) {
      return (
        <Button className="w-full" disabled variant="secondary">
          Current Plan
        </Button>
      );
    }

    if (plan.key === "recruiter_free") {
      return (
        <Button className="w-full" disabled variant="secondary">
          Current Plan
        </Button>
      );
    }

    return (
      <Button className="w-full" onClick={() => handleUpgrade(plan.key)}>
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
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-20 mt-2" />
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {[1, 2, 3, 4].map((j) => (
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
          <div className="text-center text-destructive">
            Failed to load plans. Please try again later.
          </div>
        )}

        {plans && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isPopular = plan.key === "recruiter_pro";
              const priceDisplay = plan.price === 0
                ? "Free"
                : `₹${(plan.price / 100).toLocaleString("en-IN")}/mo`;

              return (
                <Card
                  key={plan.key}
                  className={`flex flex-col relative ${isPopular ? "border-amber-400 ring-1 ring-amber-400" : ""}`}
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
