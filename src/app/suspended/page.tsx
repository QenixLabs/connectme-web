import type { Metadata } from "next";
import { AccountRestrictionPage } from "@/components/auth/account-restriction-page";

export const metadata: Metadata = { title: "Account suspended | Morporfile", description: "Your Morporfile account is temporarily suspended." };

export default function SuspendedPage() {
  return <AccountRestrictionPage kind="suspended" />;
}
