"use client";

import { Eye, CalendarDays, MessageSquare, Star, FileText } from "lucide-react";
import { motion } from "motion/react";

import type { TalentProfile } from "@/lib/api/talent";
import type { Campaign } from "@/lib/api/campaigns";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "./AnimatedNumber";

interface StatsGridProps {
  profile: TalentProfile | undefined;
  unreadCount: number;
  applications: Campaign[] | undefined;
}

const STAT_META = [
  { key: "views7d", label: "7d Views", icon: Eye, color: "text-cyan", bg: "bg-cyan/10" },
  { key: "views30d", label: "30d Views", icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
  { key: "messages", label: "Messages", icon: MessageSquare, color: "text-gold", bg: "bg-gold/10" },
  { key: "shortlists", label: "Shortlists", icon: Star, color: "text-violet", bg: "bg-violet/10" },
  { key: "applications", label: "Applications", icon: FileText, color: "text-green", bg: "bg-green/10" },
];

export function StatsGrid({ profile, unreadCount, applications }: StatsGridProps) {
  const views7d = profile?.analytics?.profile_views_7d ?? 0;
  const views30d = profile?.analytics?.profile_views_30d ?? 0;
  const shortlists = profile?.analytics?.shortlist_count ?? 0;
  const activeApplications =
    applications?.filter((a) => a.my_application?.status === "pending").length ?? 0;

  const values: Record<string, number> = {
    views7d,
    views30d,
    messages: unreadCount,
    shortlists,
    applications: activeApplications,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-5 snap-x-mandatory">
        {STAT_META.map(({ key, label, icon: Icon, color, bg }) => (
          <Card
            key={key}
            className="group min-w-[calc(50%-6px)] snap-start border-border/60 bg-surface/60 py-0 transition-all duration-200 hover:border-border-hover hover:bg-surface hover:shadow-card sm:min-w-0"
          >
            <CardContent className="flex flex-col p-4">
              <div
                className={`mb-3 flex size-10 items-center justify-center rounded-xl ${bg} ${color}`}
              >
                <Icon className="size-5" />
              </div>
              <AnimatedNumber
                value={values[key]}
                className="text-3xl font-bold tracking-tight text-foreground"
              />
              <span className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
