import type { Metadata } from "next";

import ShortlistPage from "@/components/recruiter-app/ShortlistPage";

export const metadata: Metadata = {
  title: "Morporfile â€” My Shortlist",
  description:
    "Review, compare, message and invite talent shortlisted for your campaigns.",
  openGraph: {
    title: "Morporfile â€” My Shortlist",
    description:
      "Review, compare, message and invite talent shortlisted for your campaigns.",
  },
};

export default function RecruiterShortlistRoute() {
  return <ShortlistPage />;
}
