import type { Metadata } from "next";

import { SettingsPage } from "@/components/talent-app/SettingsPage";

export const metadata: Metadata = {
  title: "Account Settings | Rootin",
  description:
    "Manage your Rootin account preferences, password, and security settings.",
  openGraph: {
    title: "Account Settings | Rootin",
    description:
      "Manage your Rootin account preferences and security.",
  },
};

export default function TalentSettingsPage() {
  return <SettingsPage />;
}
