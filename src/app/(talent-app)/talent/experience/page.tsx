import type { Metadata } from "next";
import { ExperiencePage } from "@/components/talent-app/ExperiencePage";

export const metadata: Metadata = {
  title: "Experience & Recognition — ConnectMe",
  description:
    "Manage your professional credits, testimonials, and awards.",
  openGraph: {
    title: "Experience & Recognition — ConnectMe",
    description:
      "Manage your professional credits, testimonials, and awards.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function TalentExperiencePage() {
  return <ExperiencePage />;
}
