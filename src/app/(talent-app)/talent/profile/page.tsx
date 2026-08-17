import type { Metadata } from "next";

import { ProfilePage } from "@/components/talent-app/ProfilePage";

export const metadata: Metadata = {
  title: "RootIn — My Profile",
  description:
    "Manage your talent profile, visibility, analytics and account settings on RootIn.",
  openGraph: {
    title: "RootIn — My Profile",
    description:
      "Manage your talent profile, visibility, analytics and account settings on RootIn.",
  },
};

export default function TalentProfilePage() {
  return <ProfilePage />;
}
