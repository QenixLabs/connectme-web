import type { Metadata } from "next";
import { ExperiencePage } from "@/components/talent-app/ExperiencePage";

export const metadata: Metadata = {
  title: "Awards & Training — RootIn",
  description:
    "Manage your awards, training, workshops, certifications and credits on RootIn.",
  openGraph: {
    title: "Awards & Training — RootIn",
    description:
      "Manage your awards, training, workshops, certifications and credits on RootIn.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function TalentExperiencePage() {
  return <ExperiencePage />;
}
