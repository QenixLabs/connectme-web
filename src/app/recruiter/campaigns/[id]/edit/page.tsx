'use client';

import { useParams } from 'next/navigation';
import { CampaignWizard } from '@/components/campaigns/CampaignWizard';

export default function EditCampaignPage() {
  const params = useParams();
  const campaignId = params.id as string;

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8">
      <CampaignWizard campaignId={campaignId} />
    </div>
  );
}
