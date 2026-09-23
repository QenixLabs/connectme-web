import type { Metadata } from "next";
import { TalentOnboarding } from "@/components/auth/talent-onboarding/talent-onboarding";

export const metadata: Metadata = {
  title: "Create Your Talent Account | Rootin",
  description: "Join Rootin's global community of creators and discover new opportunities.",
};

export default function TalentSignupPage() {
  return <TalentOnboarding />;
}
