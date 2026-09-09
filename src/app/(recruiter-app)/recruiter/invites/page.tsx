import type { Metadata } from "next";

import TalentInvitesPage from "@/components/recruiter-app/TalentInvitesPage";

export const metadata: Metadata = {
  title: "RootIn — Talent Invitations",
  description:
    "Manage your talent invitations and track casting responses. See who accepted, declined, or is still pending.",
  openGraph: {
    title: "RootIn — Talent Invitations",
    description:
      "Manage your talent invitations and track casting responses. See who accepted, declined, or is still pending.",
  },
};

export default function RecruiterInvitesRoute() {
  return <TalentInvitesPage />;
}
