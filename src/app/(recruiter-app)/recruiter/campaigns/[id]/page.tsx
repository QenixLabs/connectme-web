import type { Metadata } from "next";

import { CampaignDashboard } from "@/components/campaign-detail/campaign-dashboard";

export const metadata: Metadata = {
  title: "Campaign Details",
  description: "Review candidates and manage your campaign.",
  openGraph: {
    title: "Campaign Details",
    description: "Review candidates and manage your campaign.",
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
