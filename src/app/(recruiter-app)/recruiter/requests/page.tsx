import type { Metadata } from "next";

import RequestsPage from "@/components/recruiter-app/RequestsPage";

export const metadata: Metadata = {
  title: "RootIn — Requests",
  description:
    "Manage connection requests from talents and collaborators.",
  openGraph: {
    title: "RootIn — Requests",
    description:
      "Manage connection requests from talents and collaborators.",
  },
};

export default function RecruiterRequestsPage() {
  return <RequestsPage />;
}
