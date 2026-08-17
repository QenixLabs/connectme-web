import type { Metadata } from "next";
import { UnifiedAuthForm } from "@/components/auth/unified-auth-form";

export const metadata: Metadata = {
  title: "Sign In | RootIn",
  description: "Sign in or create your RootIn account — the creative talent platform.",
};

export default function AuthPage() {
  return <UnifiedAuthForm />;
}
