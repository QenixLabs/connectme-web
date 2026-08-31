import type { Metadata } from "next";

import { ProfileEditorPage } from "@/components/talent-app/profile-editor/ProfileEditorPage";

export const metadata: Metadata = {
  title: "Edit Profile — Talent Casting Portfolio",
  description:
    "Mobile-first talent profile editor: manage your headshot, skills, portfolio, showreels, credits, awards, documents and profile visibility in one place.",
  openGraph: {
    title: "Edit Profile — Talent Casting Portfolio",
    description:
      "Mobile-first talent profile editor: manage your headshot, skills, portfolio, showreels, credits, awards, documents and profile visibility in one place.",
    type: "website",
  },
};

export default function TalentProfilePage() {
  return <ProfileEditorPage />;
}
