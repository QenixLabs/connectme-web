import { SectionHeading } from "./SectionHeading";

export function Upcoming() {
  return (
    <section className="mt-6">
      <SectionHeading title="UPCOMING" action="View Calendar" href="#" small />
      <div className="mt-3 px-4 text-sm text-muted-foreground lg:px-0">
        No upcoming events. Your scheduled auditions and meetings will appear here.
      </div>
    </section>
  );
}
