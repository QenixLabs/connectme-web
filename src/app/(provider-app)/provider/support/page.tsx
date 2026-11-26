import type { Metadata } from "next";
import { SupportPage } from "@/components/support/SupportPage";

export const metadata: Metadata = {
  title: "Help & Support | Morporfiil",
  description: "Contact support and track your support tickets.",
};

export default function ProviderSupportPage() {
  return <SupportPage />;
}
