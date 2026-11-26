import type { Metadata } from "next";

import { OpportunityDetailPage } from "@/components/talent-app/OpportunityDetailPage";

export const metadata: Metadata = {
  title: "Morporfiil - Opportunity Details",
  description:
    "View campaign details, requirements, and apply to opportunities on Morporfiil.",
  openGraph: {
    title: "Morporfiil - Opportunity Details",
    description:
      "View campaign details, requirements, and apply to opportunities on Morporfiil.",
  },
};

export default function TalentOpportunityDetailPage() {
  return <OpportunityDetailPage />;
}
