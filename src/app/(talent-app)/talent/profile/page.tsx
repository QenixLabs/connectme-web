import type { Metadata } from "next";

import { ProfilePage } from "@/components/talent-app/ProfilePage";

export const metadata: Metadata = {
  title: "RootIn — Account Status",
  description:
    "Track your trust score, profile completeness, verification status and performance stats on RootIn.",
  openGraph: {
    title: "RootIn — Account Status",
    description:
      "Track your trust score, profile completeness, verification status and performance stats on RootIn.",
  },
};

export default function TalentProfilePage() {
  return <ProfilePage />;
}
