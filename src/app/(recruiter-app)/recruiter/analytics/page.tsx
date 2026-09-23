import type { Metadata } from "next";

import { AnalyticsClient } from "./analytics-client";

export const metadata: Metadata = {
  title: "Recruitment Analytics",
  description:
    "Track recruitment funnels, hiring trends, campaigns, and talent mix from live campaign data.",
  openGraph: {
    title: "Recruitment Analytics | Rootin",
    description:
      "A complete view of hiring performance and recruitment insights.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RecruiterAnalyticsPage() {
  return <AnalyticsClient />;
}
