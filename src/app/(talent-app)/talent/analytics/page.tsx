import type { Metadata } from "next";

import { TalentAnalyticsPage } from "@/components/talent-app/TalentAnalyticsPage";

export const metadata: Metadata = {
  title: "Analytics | Morporfile",
  description: "See how recruiters discover and engage with your Morporfile talent profile.",
};

export default function TalentAnalyticsRoute() {
  return <TalentAnalyticsPage />;
}
