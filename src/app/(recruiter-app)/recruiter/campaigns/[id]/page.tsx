import type { Metadata } from "next";

import { CampaignDashboard } from "@/components/campaign-detail/campaign-dashboard";

export const metadata: Metadata = {
  title: "Lead Actor Campaign — Rootin Casting",
  description:
    "Review candidates and manage the Lead Actor web series casting campaign.",
  openGraph: {
    title: "Lead Actor Campaign — Rootin Casting",
    description:
      "Review candidates and manage the Lead Actor web series casting campaign.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RecruiterCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampaignDashboard campaignId={id} />;
}
