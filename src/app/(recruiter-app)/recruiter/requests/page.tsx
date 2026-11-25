import type { Metadata } from "next";

import RequestsPage from "@/components/recruiter-app/RequestsPage";

export const metadata: Metadata = {
  title: "Morporfile â€” Requests",
  description:
    "Manage connection requests from talents and collaborators.",
  openGraph: {
    title: "Morporfile â€” Requests",
    description:
      "Manage connection requests from talents and collaborators.",
  },
};

export default function RecruiterRequestsPage() {
  return <RequestsPage />;
}
