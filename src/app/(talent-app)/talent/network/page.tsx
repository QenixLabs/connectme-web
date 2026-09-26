import type { Metadata } from "next";

import { TalentNetworkPage } from "@/components/talent-app/TalentNetworkPage";

export const metadata: Metadata = {
  title: "RootIn | Talent Network",
  description: "Find creative collaborators, join projects and build meaningful work with verified talent.",
};

export default function TalentNetworkRoute() {
  return <TalentNetworkPage />;
}
