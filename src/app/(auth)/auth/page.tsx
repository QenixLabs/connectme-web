import type { Metadata } from "next";
import { AuthEntry } from "@/components/auth/auth-entry";

export const metadata: Metadata = {
  title: "RootIn — Find the right people for extraordinary work",
  description:
    "Connect with verified creative talent, production teams and recruiters across the entertainment industry.",
};

export default function AuthPage() {
  return <AuthEntry />;
}
