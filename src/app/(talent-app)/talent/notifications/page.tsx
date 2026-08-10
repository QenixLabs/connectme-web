import type { Metadata } from "next";

import { NotificationsPage } from "@/components/talent-app/NotificationsPage";

export const metadata: Metadata = {
  title: "RootIn — Notifications",
  description:
    "Stay updated with your latest RootIn activity — casting updates, messages, and opportunities in one feed.",
  openGraph: {
    title: "RootIn — Notifications",
    description:
      "Stay updated with your latest RootIn activity in one feed.",
  },
};

export default function TalentNotificationsPage() {
  return <NotificationsPage />;
}
