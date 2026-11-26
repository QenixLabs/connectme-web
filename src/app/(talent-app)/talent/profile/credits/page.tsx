import type { Metadata } from "next";
import { CreditsPage } from "@/components/talent-app/CreditsPage";

export const metadata: Metadata = {
  title: "Credits - Morporfiil",
  description: "Manage the films, shows, campaigns and productions on your Morporfiil profile.",
  openGraph: {
    title: "Credits - Morporfiil",
    description: "Manage the films, shows, campaigns and productions on your Morporfiil profile.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function TalentCreditsPage() {
  return <CreditsPage />;
}
