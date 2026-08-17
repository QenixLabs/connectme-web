"use client";

import Link from "next/link";
import {
  Briefcase,
  FileText,
  Folder,
  MessageSquare,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  unreadCount: number;
}

const ACTIONS = [
  {
    label: "Find Jobs",
    icon: Briefcase,
    href: "/talent/opportunities",
    color: "text-cyan",
    bg: "bg-cyan/10",
    border: "border-cyan/20",
  },
  {
    label: "Applications",
    icon: FileText,
    href: "/talent/applications",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    label: "Portfolio",
    icon: Folder,
    href: "/talent/portfolio",
    color: "text-violet",
    bg: "bg-violet/10",
    border: "border-violet/20",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/talent/messages",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/20",
    badgeKey: "messages" as const,
  },
  {
    label: "Saved",
    icon: Bookmark,
    href: "#",
    color: "text-green",
    bg: "bg-green/10",
    border: "border-green/20",
  },
];

export function QuickActions({ unreadCount }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ACTIONS.map(({ label, icon: Icon, href, color, bg, border, badgeKey }) => {
          const badge = badgeKey === "messages" ? unreadCount || undefined : undefined;
          return (
            <Link key={label} href={href} className="group press-scale">
              <Card className="relative h-full min-h-[96px] border-border/60 bg-surface/60 py-0 transition-all duration-200 hover:scale-[1.01] hover:border-border-hover hover:bg-surface hover:shadow-card">
                <CardContent className="flex h-full flex-col items-start justify-between p-4">
                  <div className="flex w-full items-start justify-between">
                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-xl border",
                        color,
                        bg,
                        border
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    {badge ? (
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground shadow-glow">
                        {badge}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex w-full items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {label}
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
