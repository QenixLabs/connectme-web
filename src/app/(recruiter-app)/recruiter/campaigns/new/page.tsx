"use client";

import { CampaignWizard } from "@/components/campaign-wizard/campaign-wizard";

export default function RecruiterCampaignNewPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-28">
      <div className="mx-auto w-full max-w-2xl px-4 pt-4 sm:px-6">
        <CampaignWizard />
      </div>
    </div>
  );
}
