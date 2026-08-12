import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { SectionHeading } from "./SectionHeading";

export function Upcoming() {
  return (
    <section className="mt-6">
      <SectionHeading title="UPCOMING" action="View Calendar" href="#" small />
      <Card className="mx-4 mt-3 flex flex-col items-center gap-3 rounded-2xl border-border/50 py-10 text-center lg:mx-0">
        <Calendar className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No upcoming events. Your scheduled auditions and meetings will appear here.
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href="#">Schedule Meeting</a>
        </Button>
      </Card>
    </section>
  );
}
