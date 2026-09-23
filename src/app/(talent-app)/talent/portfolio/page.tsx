import type { Metadata } from "next";

import { PortfolioPage } from "@/components/talent-app/PortfolioPage";

export const metadata: Metadata = {
  title: "RootIn — Media Library",
  description:
    "Manage and showcase your photos, videos and documents on RootIn.",
  openGraph: {
    title: "RootIn — Media Library",
    description: "Manage and showcase your photos, videos and documents on RootIn.",
  },
};

export default function TalentPortfolioPage() {
  return <PortfolioPage />;
}
