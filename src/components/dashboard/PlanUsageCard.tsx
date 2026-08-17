"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "motion/react";

import type { SubscriptionResponse, UsageResponse } from "@/lib/api/subscriptions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function formatPlanName(planKey?: string | null): string {
  if (!planKey) return "Free";
  return planKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPaidPlan(planKey?: string | null): boolean {
  if (!planKey) return false;
  return !["free"].includes(planKey.toLowerCase());
}

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const safeLimit = Math.max(limit, 1);
  const pct = Math.min((used / safeLimit) * 100, 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {used} / {limit}{" "}
          <span className="ml-1 text-muted-foreground">({Math.round(pct)}%)</span>
        </span>
      </div>
      <Progress value={pct} className="h-1.5 bg-muted" />
    </div>
  );
}

interface PlanUsageCardProps {
  subscription: SubscriptionResponse | undefined;
  usage: UsageResponse | undefined;
}

export function PlanUsageCard({ subscription, usage }: PlanUsageCardProps) {
  const planKey = subscription?.subscription?.plan_key;
  const planName = subscription?.plan?.display_name || formatPlanName(planKey);
  const paid = isPaidPlan(planKey);

  const renewalDate = subscription?.subscription?.current_period_end
    ? new Date(subscription.subscription.current_period_end).toLocaleDateString(
        "en-US",
        { day: "numeric", month: "short", year: "numeric" }
      )
    : null;

  const messagesUsed = usage?.messages?.used ?? 0;
  const messagesLimit = usage?.messages?.limit ?? 0;
  const imagesUsed = usage?.media?.images?.used ?? 0;
  const imagesLimit = usage?.media?.images?.limit ?? 0;
  const videosUsed = usage?.media?.videos?.used ?? 0;
  const videosLimit = usage?.media?.videos?.limit ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border-border/60 bg-surface/60 py-0 transition-all duration-200 hover:border-border-hover">
        <CardContent className="p-5">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                <Zap className="size-5" />
              </div>
              <div className="min-w-0">
                <Badge
                  variant="outline"
                  className={`truncate rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    paid
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-border bg-background/50 text-muted-foreground"
                  }`}
                >
                  {planName}
                </Badge>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {renewalDate ? `Renews ${renewalDate}` : "Upgrade to unlock more"}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-green">
              <span className="size-1.5 rounded-full bg-green shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
              {subscription?.subscription?.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="space-y-3">
            {messagesLimit > 0 && (
              <UsageBar label="Messages" used={messagesUsed} limit={messagesLimit} />
            )}
            {imagesLimit > 0 && (
              <UsageBar label="Images" used={imagesUsed} limit={imagesLimit} />
            )}
            {videosLimit > 0 && (
              <UsageBar label="Videos" used={videosUsed} limit={videosLimit} />
            )}
            {messagesLimit === 0 && imagesLimit === 0 && videosLimit === 0 && (
              <p className="text-xs text-muted-foreground">
                No usage limits configured for this plan.
              </p>
            )}
          </div>

          <Button
            asChild
            variant="outline"
            className="mt-5 w-full rounded-full border-border bg-background/50 text-foreground hover:bg-surface-2"
          >
            <Link href={paid ? "/talent/subscription" : "/pricing"}>
              {paid ? "Manage plan" : "Upgrade plan"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
