import type { Metadata } from "next";
import { AccountRestrictionPage } from "@/components/auth/account-restriction-page";

export const metadata: Metadata = { title: "Account banned | Morporfiil", description: "Your Morporfiil account has been permanently restricted." };

export default function BannedPage() {
  return <AccountRestrictionPage kind="banned" />;
}
