import type { Metadata } from "next";
import { RootinLandingPage } from "@/components/landing/rootin-landing-page";

const title = "Rootin — People. Talent. Opportunities.";
const description =
  "Rootin connects entertainment talent, recruiters, and creative service providers across India.";

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
  return <RootinLandingPage />;
}
