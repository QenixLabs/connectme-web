import type { Metadata } from "next";

import { PortfolioPage } from "@/components/talent-app/PortfolioPage";

export const metadata: Metadata = {
  title: "Morporfile â€” Media Library",
  description:
    "Manage and showcase your photos, videos and documents on Morporfile.",
  openGraph: {
    title: "Morporfile â€” Media Library",
    description: "Manage and showcase your photos, videos and documents on Morporfile.",
  },
};

export default function TalentPortfolioPage() {
  return <PortfolioPage />;
}
