import type { Metadata } from "next";

import { NotificationsPage } from "@/components/talent-app/NotificationsPage";

export const metadata: Metadata = {
  title: "Morporfiil - Notifications",
  description:
    "Stay updated with your latest Morporfiil activity â€” casting updates, messages, and opportunities in one feed.",
  openGraph: {
    title: "Morporfiil - Notifications",
    description:
      "Stay updated with your latest Morporfiil activity in one feed.",
  },
};

export default function TalentNotificationsPage() {
  return <NotificationsPage />;
}
