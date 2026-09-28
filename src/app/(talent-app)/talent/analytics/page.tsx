import type { Metadata } from "next";

import { TalentAnalyticsPage } from "@/components/talent-app/TalentAnalyticsPage";

export const metadata: Metadata = {
  title: "Analytics | RootIn",
  description: "See how recruiters discover and engage with your RootIn talent profile.",
};

export default function TalentAnalyticsRoute() {
  return <TalentAnalyticsPage />;
}
