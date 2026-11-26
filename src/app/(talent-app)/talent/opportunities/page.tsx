import { Suspense } from "react";
import type { Metadata } from "next";

import { OpportunitiesPage } from "@/components/talent-app/OpportunitiesPage";

export const metadata: Metadata = {
  title: "Morporfiil - Opportunities",
  description:
    "Discover casting calls, modeling gigs, and creative roles that match your talent on Morporfiil.",
  openGraph: {
    title: "Morporfiil - Opportunities",
    description:
      "Discover casting calls, modeling gigs, and creative roles that match your talent on Morporfiil.",
  },
};

export default function TalentOpportunitiesPage() {
  return (
    <Suspense fallback={null}>
      <OpportunitiesPage />
    </Suspense>
  );
}
