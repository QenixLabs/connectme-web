import type { Metadata } from "next";
import { AccountRestrictionPage } from "@/components/auth/account-restriction-page";

export const metadata: Metadata = { title: "Account suspended | RootIn", description: "Your RootIn account is temporarily suspended." };

export default function SuspendedPage() {
  return <AccountRestrictionPage kind="suspended" />;
}
