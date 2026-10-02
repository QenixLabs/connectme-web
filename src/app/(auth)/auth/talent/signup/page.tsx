import type { Metadata } from "next";
import { TalentOnboarding } from "@/components/auth/talent-onboarding/talent-onboarding";

export const metadata: Metadata = {
  title: "Create Your Talent Account | Rootin",
  description: "Join Rootin's global community of creators and discover new opportunities.",
};

export default async function TalentSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return <TalentOnboarding isGoogleResume={params.resume === "1"} />;
}
