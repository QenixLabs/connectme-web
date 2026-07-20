'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CampaignWizard } from '@/components/campaigns/CampaignWizard';

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8 pb-10">
      <button
        type="button"
        onClick={() => router.push(`/recruiter/campaigns/${campaignId}`)}
        className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-6 group font-medium"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
        Back to campaign
      </button>
      <CampaignWizard campaignId={campaignId} />
    </div>
  );
}
