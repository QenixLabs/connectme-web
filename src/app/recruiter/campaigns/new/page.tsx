import { CampaignWizard } from '@/components/campaigns/CampaignWizard';
import { SectionHeader } from '@/components/ui/section-header';

export default function NewCampaignPage() {
  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 space-y-6">
      <SectionHeader
        title="New Campaign"
        subtitle="Create a new casting call or project"
      />
      <CampaignWizard />
    </div>
  );
}
