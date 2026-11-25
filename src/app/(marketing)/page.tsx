import type { Metadata } from "next";
import { MorporfileLandingPage } from "@/components/landing/morporfile-landing-page";

const title = "Morporfile â€” People. Talent. Opportunities.";
const description =
  "Morporfile connects entertainment talent, recruiters, and creative service providers across India.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description: "Where talent connects with opportunities in India's entertainment industry.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function MarketingHomePage() {
  return <MorporfileLandingPage />;
}
