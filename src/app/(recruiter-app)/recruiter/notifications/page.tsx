import type { Metadata } from "next";

import { NotificationsPage } from "@/components/recruiter-app/NotificationsPage";

export const metadata: Metadata = {
  title: "RootIn — Notifications",
  description:
    "Stay updated with your latest recruiting activity — applications, messages, and campaign updates in one feed.",
  openGraph: {
    title: "RootIn — Notifications",
    description:
      "Stay updated with your latest recruiting activity in one feed.",
  },
};

export default function RecruiterNotificationsPage() {
  return <NotificationsPage />;
}
