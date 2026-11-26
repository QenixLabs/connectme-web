import type { Metadata } from "next";

import { PortfolioPage } from "@/components/talent-app/PortfolioPage";

export const metadata: Metadata = {
  title: "Morporfiil - Media Library",
  description:
    "Manage and showcase your photos, videos and documents on Morporfiil.",
  openGraph: {
    title: "Morporfiil - Media Library",
    description: "Manage and showcase your photos, videos and documents on Morporfiil.",
  },
};

export default function TalentPortfolioPage() {
  return <PortfolioPage />;
}
