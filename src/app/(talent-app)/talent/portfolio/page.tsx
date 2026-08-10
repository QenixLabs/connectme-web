import type { Metadata } from "next";

import { PortfolioPage } from "@/components/talent-app/PortfolioPage";

export const metadata: Metadata = {
  title: "RootIn — My Portfolio",
  description:
    "Showcase your best work to get noticed by top recruiters and clients on RootIn.",
  openGraph: {
    title: "RootIn — My Portfolio",
    description:
      "Showcase your best work to get noticed by top recruiters and clients on RootIn.",
  },
};

export default function TalentPortfolioPage() {
  return <PortfolioPage />;
}
