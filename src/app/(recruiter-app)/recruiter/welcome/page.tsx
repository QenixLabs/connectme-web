import type { Metadata } from "next";
import { RecruiterWelcome } from "@/components/recruiter/welcome/recruiter-welcome";

export const metadata: Metadata = {
  title: "Morporfile â€” Find Verified Talent for Film, OTT, TV & Music",
  description:
    "Morporfile connects casting teams with verified actors, models, singers, dancers and creators. Build projects and launch casting campaigns in minutes.",
  openGraph: {
    title: "Morporfile â€” Right People. Bigger Stories.",
    description:
      "Discover verified talent, build your projects and create unforgettable stories with AI-powered casting.",
    type: "website",
  },
};

export default function RecruiterWelcomePage() {
  return <RecruiterWelcome />;
}
