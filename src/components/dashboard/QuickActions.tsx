import Link from "next/link";
import { Briefcase, FileText, Folder, MessageSquare, Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDashboard } from "./DashboardProvider";

export function QuickActions() {
  const { unreadCount } = useDashboard();

  const ACTIONS = [
    { label: "Find Jobs", Icon: Briefcase, href: "/talent/opportunities" },
    { label: "My Applications", Icon: FileText, href: "/talent/applications" },
    { label: "Portfolio / Media Kit", Icon: Folder, href: "/talent/portfolio" },
    { label: "Messages", Icon: MessageSquare, href: "/talent/messages", badge: unreadCount || undefined },
    { label: "Saved", Icon: Bookmark, href: "#" },
  ];

  return (
    <section className="mt-6 lg:mt-0">
      <h3 className="px-5 text-[22px] font-bold lg:px-0">Quick Actions</h3>
      <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:px-0 [&::-webkit-scrollbar]:hidden">
        {ACTIONS.map(({ label, Icon, href, badge }) => (
          <Button
            key={label}
            asChild
            variant="outline"
            className="relative h-[120px] w-[110px] shrink-0 flex-col gap-3 rounded-2xl bg-card whitespace-normal shadow-none hover:bg-card lg:w-auto"
          >
            <Link href={href}>
              <Icon className="size-8 stroke-[1.5] text-primary" />
              <span className="px-1 text-center text-sm leading-tight font-medium">{label}</span>
              {badge ? (
                <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {badge}
                </span>
              ) : null}
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
