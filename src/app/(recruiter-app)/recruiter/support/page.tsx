import type { Metadata } from "next";

import { SupportPage } from "@/components/support/SupportPage";

export const metadata: Metadata = {
  title: "Help & Support | Rootin",
  description:
    "Search answers, browse help topics, contact support, and track your support tickets.",
  openGraph: {
    title: "Rootin Help & Support",
    description:
      "Find answers, contact the support team, and track your support requests.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RecruiterSupportPage() {
  return <SupportPage />;
}
