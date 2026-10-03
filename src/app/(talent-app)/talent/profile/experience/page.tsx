import type { Metadata } from "next";
import { WorkExperiencePage } from "@/components/talent-app/WorkExperiencePage";

export const metadata: Metadata = {
  title: "Work Experience — RootIn",
  description: "Manage the roles, studios and projects on your RootIn profile.",
  openGraph: {
    title: "Work Experience — RootIn",
    description: "Manage the roles, studios and projects on your RootIn profile.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function TalentWorkExperiencePage() {
  return <WorkExperiencePage />;
}
