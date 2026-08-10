import type { Metadata } from "next";

import { OpportunitiesPage } from "@/components/talent-app/OpportunitiesPage";

export const metadata: Metadata = {
  title: "RootIn — Opportunities",
  description:
    "Discover casting calls, modeling gigs, and creative roles that match your talent on RootIn.",
  openGraph: {
    title: "RootIn — Opportunities",
    description:
      "Discover casting calls, modeling gigs, and creative roles that match your talent on RootIn.",
  },
};

export default function TalentOpportunitiesPage() {
  return <OpportunitiesPage />;
}
