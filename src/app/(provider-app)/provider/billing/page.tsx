import type { Metadata } from "next";
import { ProviderBillingPage } from "@/components/provider/provider-billing-page";

export const metadata: Metadata = {
  title: "Provider Billing | Morporfile",
  description: "Manage your provider plan, payments and invoices.",
};

export default function ProviderBillingRoute() {
  return <ProviderBillingPage />;
}
