import type { Metadata } from "next";

import { DashboardContent } from "@/components/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "RootIn — Talent Dashboard for Actors & Models",
  description:
    "Track profile strength, auditions, casting opportunities and recruiter activity in one talent dashboard.",
  openGraph: {
    title: "RootIn — Talent Dashboard",
    description:
      "Track profile strength, auditions, casting opportunities and recruiter activity in one place.",
  },
};

export default function TalentDashboardPage() {
  return <DashboardContent />;
}
