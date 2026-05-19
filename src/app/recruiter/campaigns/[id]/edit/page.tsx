'use client';

import { useParams } from 'next/navigation';
import { CampaignWizard } from '@/components/campaigns/CampaignWizard';
import { SectionHeader } from '@/components/ui/section-header';

export default function EditCampaignPage() {
  const params = useParams();
  const campaignId = params.id as string;

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 flex flex-col gap-5">
      <SectionHeader
        title="Edit Campaign"
        subtitle="Update your casting call details"
      />
      <CampaignWizard campaignId={campaignId} />
    </div>
  );
}
