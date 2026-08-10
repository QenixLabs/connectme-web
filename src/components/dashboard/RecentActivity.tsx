import { SectionHeading } from "./SectionHeading";

export function RecentActivity() {
  return (
    <section className="mt-6">
      <SectionHeading title="Recent Activity" action="View All" href="#" />
      <div className="mt-3 px-4 text-sm text-muted-foreground lg:px-0">
        No recent activity. Profile views and interactions will show up here.
      </div>
    </section>
  );
}
