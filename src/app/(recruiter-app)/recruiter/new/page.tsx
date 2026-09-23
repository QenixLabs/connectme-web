import type { Metadata } from "next";
import { RecruiterWelcome } from "@/components/recruiter/welcome/recruiter-welcome";

export const metadata: Metadata = {
  title: "Rootin — Find Verified Talent for Film, OTT, TV & Music",
  description:
    "Rootin connects casting teams with verified actors, models, singers, dancers and creators. Build projects and launch casting campaigns in minutes.",
  openGraph: {
    title: "Rootin — Right People. Bigger Stories.",
    description:
      "Discover verified talent, build your projects and create unforgettable stories with AI-powered casting.",
    type: "website",
  },
};

export default function RecruiterNewPage() {
  // Dev preview: renders without the show-once gate (no redirect, no
  // localStorage marking), so the screen stays visible while iterating.
  return <RecruiterWelcome skipGate />;
}
