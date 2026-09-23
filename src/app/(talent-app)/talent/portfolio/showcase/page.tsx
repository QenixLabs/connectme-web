import type { Metadata } from "next";
import { ShowcaseManagerPage } from "@/components/talent-app/ShowcaseManagerPage";

export const metadata: Metadata = {
  title: "RootIn — Profile Showcase",
  description: "Choose and arrange the work recruiters see first on your profile.",
};

export default function TalentShowcasePage() {
  return <ShowcaseManagerPage />;
}
