import { Eye, Calendar, MessageSquare, Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useDashboard } from "./DashboardProvider";

export function Overview() {
  const { profile, unreadCount } = useDashboard();

  const views7d = profile?.analytics?.profile_views_7d ?? 0;
  const views30d = profile?.analytics?.profile_views_30d ?? 0;
  const shortlists = profile?.analytics?.shortlist_count ?? 0;

  const STATS = [
    {
      label: "7D VIEWS",
      Icon: Eye,
      value: Math.max(0, views7d).toLocaleString(),
    },
    {
      label: "30D VIEWS",
      Icon: Calendar,
      value: Math.max(0, views30d).toLocaleString(),
    },
    {
      label: "MESSAGES",
      Icon: MessageSquare,
      value: Math.max(0, unreadCount).toLocaleString(),
    },
    {
      label: "SHORTLISTS",
      Icon: Star,
      value: Math.max(0, shortlists).toLocaleString(),
    },
  ];

  return (
    <section className="mt-6 lg:mt-0">
      <h3 className="px-5 font-sans text-[22px] font-bold lg:px-0">
        Overview <span className="text-base font-normal text-muted-foreground">(This Week)</span>
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-3 px-4 sm:grid-cols-4 lg:grid-cols-2 lg:px-0 xl:grid-cols-4">
        {STATS.map(({ label, Icon, value }) => (
          <Card key={label} className="min-w-0 gap-0 rounded-2xl p-3.5 shadow-none">
            <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground">
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </div>
            <p className="mt-2 text-[28px] leading-none font-bold">{value}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
