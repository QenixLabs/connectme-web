import type { Metadata } from "next";

import { ProfileVisibilityPage } from "@/components/talent-app/ProfileVisibilityPage";

export const metadata: Metadata = {
  title: "Profile Visibility | Morporfiil",
  description: "Choose how your talent profile appears across Morporfiil.",
};

export default function ProfileVisibilityRoute() {
  return <ProfileVisibilityPage />;
}
