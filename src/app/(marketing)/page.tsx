import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

const title = "Rootin — Find Creative Talent";
const description =
  "Discover talent, showcase your work, and unlock creative opportunities with Rootin.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description: "One platform for creative talent, recruiters, and extraordinary opportunities.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function MarketingHomePage() {
  return <OnboardingFlow />;
}
