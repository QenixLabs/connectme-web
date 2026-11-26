import type { Metadata } from "next";

import RequestsPage from "@/components/recruiter-app/RequestsPage";

export const metadata: Metadata = {
  title: "Morporfiil - Requests",
  description:
    "Manage connection requests from talents and collaborators.",
  openGraph: {
    title: "Morporfiil - Requests",
    description:
      "Manage connection requests from talents and collaborators.",
  },
};

export default function RecruiterRequestsPage() {
  return <RequestsPage />;
}
