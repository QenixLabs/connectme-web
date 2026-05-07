import { Clock } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function TalentOpportunitiesPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Opportunities"
        subtitle="Casting calls matched to your profile"
      />

      <EmptyState
        icon={<Clock className="w-8 h-8 text-text-muted" strokeWidth={1.5} />}
        title="No opportunities yet"
        description="Complete your profile to get matched with casting calls from verified recruiters."
      />
    </div>
  );
}
