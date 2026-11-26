import type { Metadata } from "next";
import { ProviderSignupFlow } from "@/components/auth/provider-signup/signup-flow";

export const metadata: Metadata = {
  title: "Morporfiil - Provider Signup | Grow Your Creative Business",
  description:
    "Join Morporfiil as a verified service provider. Showcase your creative services, receive inquiries from directors and production houses, and expand your business.",
};

export default function ProviderAuthPage() {
  return <ProviderSignupFlow />;
}
