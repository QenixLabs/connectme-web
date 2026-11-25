import type { Metadata } from "next";

import { OpportunityDetailPage } from "@/components/talent-app/OpportunityDetailPage";

export const metadata: Metadata = {
  title: "Morporfile â€” Opportunity Details",
  description:
    "View campaign details, requirements, and apply to opportunities on Morporfile.",
  openGraph: {
    title: "Morporfile â€” Opportunity Details",
    description:
      "View campaign details, requirements, and apply to opportunities on Morporfile.",
  },
};

export default function TalentOpportunityDetailPage() {
  return <OpportunityDetailPage />;
}
