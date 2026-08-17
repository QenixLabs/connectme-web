"use client";

import { useParams } from "next/navigation";
import { CampaignWizard } from "@/components/campaign-wizard/campaign-wizard";

export default function RecruiterCampaignEditPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-bg-page pb-28">
      <div className="mx-auto w-full max-w-2xl px-4 pt-4 sm:px-6">
        <CampaignWizard campaignId={params.id} />
      </div>
    </div>
  );
}
