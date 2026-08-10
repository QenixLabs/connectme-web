import { SectionHeading } from "./SectionHeading";

export function Recommended() {
  return (
    <section className="mt-6">
      <SectionHeading title="Recommended for you" action="View all" href="#" />
      <div className="mt-3 px-4 text-sm text-muted-foreground lg:px-0">
        No recommendations yet. Complete your profile to get matched with peers.
      </div>
    </section>
  );
}
