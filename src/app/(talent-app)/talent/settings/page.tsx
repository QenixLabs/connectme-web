import type { Metadata } from "next";

import { SettingsPage } from "@/components/talent-app/SettingsPage";

export const metadata: Metadata = {
  title: "Account Settings | ConnectMe",
  description:
    "Manage your ConnectMe account preferences, password, and security settings.",
  openGraph: {
    title: "Account Settings | ConnectMe",
    description:
      "Manage your ConnectMe account preferences and security.",
  },
};

export default function TalentSettingsPage() {
  return <SettingsPage />;
}
