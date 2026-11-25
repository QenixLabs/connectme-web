import { Suspense } from "react";
import type { Metadata } from "next";

import { OpportunitiesPage } from "@/components/talent-app/OpportunitiesPage";

export const metadata: Metadata = {
  title: "Morporfile â€” Opportunities",
  description:
    "Discover casting calls, modeling gigs, and creative roles that match your talent on Morporfile.",
  openGraph: {
    title: "Morporfile â€” Opportunities",
    description:
      "Discover casting calls, modeling gigs, and creative roles that match your talent on Morporfile.",
  },
};

export default function TalentOpportunitiesPage() {
  return (
    <Suspense fallback={null}>
      <OpportunitiesPage />
    </Suspense>
  );
}
