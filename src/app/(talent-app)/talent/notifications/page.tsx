import type { Metadata } from "next";

import { NotificationsPage } from "@/components/talent-app/NotificationsPage";

export const metadata: Metadata = {
  title: "Morporfile â€” Notifications",
  description:
    "Stay updated with your latest Morporfile activity â€” casting updates, messages, and opportunities in one feed.",
  openGraph: {
    title: "Morporfile â€” Notifications",
    description:
      "Stay updated with your latest Morporfile activity in one feed.",
  },
};

export default function TalentNotificationsPage() {
  return <NotificationsPage />;
}
