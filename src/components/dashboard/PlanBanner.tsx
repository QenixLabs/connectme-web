import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDashboard } from "./DashboardProvider";

function formatPlanName(planKey?: string | null): string {
  if (!planKey) return "Free";
  return planKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PlanBanner() {
  const { subscription, profile } = useDashboard();
  const planKey = subscription?.subscription?.plan_key || profile?.user_id && null;
  const planName = formatPlanName(planKey);

  return (
    <Card className="mx-4 mt-5 flex-row items-center gap-3 rounded-2xl p-4 shadow-none lg:mx-0 lg:mt-0">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-primary">
        <Zap className="size-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-medium">
            {planName}
          </Badge>
          <span className="text-sm">You&apos;re on the {planName} plan</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Upgrade for premium features and more visibility.
        </p>
      </div>
      <Button
        asChild
        variant="ghost"
        className="shrink-0 gap-1 px-0 text-sm text-primary hover:text-primary"
      >
        <Link href="/pricing">
          Upgrade <ArrowRight className="size-4" />
        </Link>
      </Button>
    </Card>
  );
}
