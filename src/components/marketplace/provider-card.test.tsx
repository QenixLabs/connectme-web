import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProviderCard } from "@/components/marketplace/provider-card";
import type { PublicProviderSummary } from "@/lib/api/marketplace";

const provider: PublicProviderSummary = {
  id: "provider-id",
  slug: "jane-doe",
  display_name: "Jane Doe",
  categories: ["Design"],
  service_areas: [],
  skills: [],
  services_count: 1,
  starting_price: null,
  average_rating: null,
  review_count: 0,
};

describe("ProviderCard", () => {
  it("links to the public provider profile and avoids inventing an unrated score", () => {
    const markup = renderToStaticMarkup(createElement(ProviderCard, { provider }));
    expect(markup).toContain('href="/providers/jane-doe"');
    expect(markup).toContain("Jane Doe");
    expect(markup).toContain("No reviews yet");
    expect(markup).not.toContain("0.0");
  });

  it("shows the supplied approved rating and review count", () => {
    const markup = renderToStaticMarkup(
      createElement(ProviderCard, {
        provider: { ...provider, average_rating: 4.7, review_count: 12 },
      }),
    );
    expect(markup).toContain("4.7");
    expect(markup).toContain("(12)");
  });
});
