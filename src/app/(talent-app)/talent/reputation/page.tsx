import type { Metadata } from "next";

import { TalentReputationPage } from "@/components/talent-app/TalentReputationPage";

export const metadata: Metadata = {
  title: "Talent Reputation | RootIn",
  description: "Build trust, showcase your work and open the door to bigger opportunities.",
};

export default function TalentReputationRoute() {
  return <TalentReputationPage />;
}
