import type { Metadata } from "next";

import { ApplicationsPage } from "@/components/talent-app/ApplicationsPage";

export const metadata: Metadata = {
  title: "My Applications | Morporfile",
  description:
    "Track every casting call and gig you've applied for on Morporfile â€” pending, accepted, rejected and expired applications in one place.",
  openGraph: {
    title: "My Applications | Morporfile",
    description:
      "Track every casting call and gig you've applied for on Morporfile in one place.",
  },
};

export default function TalentApplicationsPage() {
  return <ApplicationsPage />;
}
