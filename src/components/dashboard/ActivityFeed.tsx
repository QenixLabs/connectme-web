"use client";

import Link from "next/link";
import {
  Bell,
  FileText,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Sparkles,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";

import type { Notification } from "@/lib/api/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { SectionHeading } from "./SectionHeading";

const iconMap: Record<string, React.ElementType> = {
  verification_status: Shield,
  campaign_invite: Sparkles,
  application_received: FileText,
  application_status_changed: CheckCircle,
  moderation_violation: AlertCircle,
  subscription_status: CreditCard,
  subscription_renewal_reminder: CreditCard,
  subscription_payment_failed: CreditCard,
  subscription_invoice_receipt: CreditCard,
  subscription_expired: CreditCard,
  subscription_cancelled: CreditCard,
  subscription_activated: CreditCard,
  campaign_recommendation: Sparkles,
  task_assigned: FileText,
  task_submitted: FileText,
  task_reviewed: CheckCircle,
  system: Bell,
};

const colorMap: Record<string, string> = {
  verification_status: "text-cyan bg-cyan/10",
  campaign_invite: "text-gold bg-gold/10",
  application_received: "text-primary bg-primary/10",
  application_status_changed: "text-green bg-green/10",
  moderation_violation: "text-destructive bg-destructive/10",
  subscription_status: "text-violet bg-violet/10",
  campaign_recommendation: "text-gold bg-gold/10",
  system: "text-muted-foreground bg-muted",
};

interface ActivityFeedProps {
  notifications: Notification[] | undefined;
}

export function ActivityFeed({ notifications }: ActivityFeedProps) {
  const hasItems = notifications && notifications.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <SectionHeading
        title="Recent Activity"
        action="View all"
        href="/talent/notifications"
      />

      {!hasItems ? (
        <EmptyState
          icon={Bell}
          title="No recent activity"
          description="Profile views, invites, and updates will show up here."
          action="View notifications"
          href="/talent/notifications"
          className="mt-3"
        />
      ) : (
        <Card className="mt-3 border-border/60 bg-surface/60 py-0 transition-all duration-200 hover:border-border-hover">
          <CardContent className="flex flex-col p-2">
            {notifications!.map((n) => {
              const Icon = iconMap[n.type] || Bell;
              const color = colorMap[n.type] || colorMap.system;
              return (
                <Link
                  key={n._id}
                  href="/talent/notifications"
                  className={cn(
                    "group flex min-w-0 items-start gap-3 rounded-xl p-3 transition-colors hover:bg-surface",
                    n.status === "unread" && "bg-primary/[0.03]"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg",
                      color
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {n.title}
                      </p>
                      <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                        {n.created_at
                          ? formatDistanceToNow(new Date(n.created_at), {
                              addSuffix: true,
                            })
                          : ""}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {n.body}
                    </p>
                  </div>
                  {n.status === "unread" && (
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-primary shadow-glow" />
                  )}
                </Link>
              );
            })}
            <Button
              asChild
              variant="ghost"
              className="mt-1 h-auto w-full justify-center rounded-lg py-2 text-xs font-medium text-primary hover:bg-primary/5"
            >
              <Link href="/talent/notifications">See all activity</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
