import { FilePlus } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function RecruiterCampaignsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Campaigns"
        subtitle="Manage your casting calls and projects"
        action={
          <Button variant="primary" className="px-4 py-2 h-auto text-sm rounded-lg">
            + New
          </Button>
        }
      />

      <EmptyState
        icon={<FilePlus className="w-8 h-8 text-text-muted" strokeWidth={1.5} />}
        title="No campaigns yet"
        description="Post your first casting call to start receiving applications from verified talent."
      />
    </div>
  );
}
