import { MapPin, Users, Briefcase } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { SectionHeading } from "./SectionHeading";
import { useDashboard } from "./DashboardProvider";

export function Opportunities() {
  const { campaignRecommendations } = useDashboard();

  if (campaignRecommendations.length === 0) {
    return (
      <section className="mt-6">
        <SectionHeading title="Opportunities for you" action="View all" href="/talent/opportunities" />
        <Card className="mx-4 mt-3 flex flex-col items-center gap-3 rounded-2xl border-border/50 py-10 text-center lg:mx-0">
          <Briefcase className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No opportunities available right now. Check back later!
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <SectionHeading title="Opportunities for you" action="View all" href="/talent/opportunities" />
      <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:px-0 [&::-webkit-scrollbar]:hidden">
        {campaignRecommendations.map((item) => (
          <Card
            key={item._id}
            className="relative h-[150px] w-[230px] shrink-0 justify-between overflow-hidden rounded-2xl border-border/50 p-3.5 shadow-none"
          >
            <Badge
              variant="outline"
              className="relative z-10 rounded-full border-border/70 bg-background/40 px-3 py-1 text-xs font-medium"
            >
              {item.role_type || "Opportunity"}
            </Badge>
            <div className="relative z-10">
              <h4 className="truncate text-[15px] font-semibold">{item.name}</h4>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" /> {item.location?.city || "Remote"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-4" /> {item.applications_count}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
