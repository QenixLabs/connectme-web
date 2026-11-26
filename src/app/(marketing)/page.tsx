import type { Metadata } from "next";
import { MorporfiilLandingPage } from "@/components/landing/morporfiil-landing-page";

const title = "Morporfiil - People. Talent. Opportunities.";
const description =
  "Morporfiil connects entertainment talent, recruiters, and creative service providers across India.";

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
  return <MorporfiilLandingPage />;
}
