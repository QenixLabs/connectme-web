import type { Metadata } from "next";

import { BillingPage } from "@/components/talent-app/BillingPage";

export const metadata: Metadata = {
  title: "Billing & Plan | RootIn",
  description:
    "Manage your RootIn plan, track upload usage, add a payment method and review billing history in one place.",
  openGraph: {
    title: "Billing & Plan | RootIn",
    description:
      "Manage your RootIn plan, usage and payments in one place.",
  },
};

export default function TalentBillingPage() {
  return <BillingPage />;
}
