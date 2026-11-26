import type { Metadata } from "next";

import { TalentAnalyticsPage } from "@/components/talent-app/TalentAnalyticsPage";

export const metadata: Metadata = {
  title: "Analytics | Morporfiil",
  description: "See how recruiters discover and engage with your Morporfiil talent profile.",
};

export default function TalentAnalyticsRoute() {
  return <TalentAnalyticsPage />;
}
