import type { Metadata } from "next";

import { OpportunityDetailPage } from "@/components/talent-app/OpportunityDetailPage";

export const metadata: Metadata = {
  title: "RootIn — Opportunity Details",
  description:
    "View campaign details, requirements, and apply to opportunities on RootIn.",
  openGraph: {
    title: "RootIn — Opportunity Details",
    description:
      "View campaign details, requirements, and apply to opportunities on RootIn.",
  },
};

export default function TalentOpportunityDetailPage() {
  return <OpportunityDetailPage />;
}
