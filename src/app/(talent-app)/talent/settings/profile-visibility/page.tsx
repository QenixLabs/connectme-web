import type { Metadata } from "next";

import { ProfileVisibilityPage } from "@/components/talent-app/ProfileVisibilityPage";

export const metadata: Metadata = {
  title: "Profile Visibility | Rootin",
  description: "Choose how your talent profile appears across Rootin.",
};

export default function ProfileVisibilityRoute() {
  return <ProfileVisibilityPage />;
}
