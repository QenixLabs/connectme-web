import type { Metadata } from "next";

import SavedTalentPage from "@/components/recruiter-app/SavedTalentPage";

export const metadata: Metadata = {
  title: "RootIn — Saved Talent",
  description:
    "View and manage all the talent you have saved. Invite them to campaigns or share their profiles.",
  openGraph: {
    title: "RootIn — Saved Talent",
    description:
      "View and manage all the talent you have saved. Invite them to campaigns or share their profiles.",
  },
};

export default function RecruiterSavedTalentRoute() {
  return <SavedTalentPage />;
}
