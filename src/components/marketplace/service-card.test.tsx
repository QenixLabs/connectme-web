import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ServiceCard } from "@/components/marketplace/service-card";
import type { PublicServiceSummary } from "@/lib/api/marketplace";

const service: PublicServiceSummary = {
  id: "service-id",
  title: "Brand identity package",
  description: "Design work for small businesses.",
  category: "Design",
  images: [],
  service_areas: [],
  provider: {
    slug: "jane-doe",
    display_name: "Jane Doe",
    categories: ["Design"],
    service_areas: [],
    skills: [],
    average_rating: null,
    review_count: 0,
  },
};

describe("ServiceCard", () => {
  it("links to service details and shows an unrated state when no review exists", () => {
    const markup = renderToStaticMarkup(createElement(ServiceCard, { service }));
    expect(markup).toContain('href="/services/service-id"');
    expect(markup).toContain("Brand identity package");
    expect(markup).toContain("Jane Doe");
    expect(markup).toContain("No reviews yet");
  });

  it("shows only the provider rating supplied by the API", () => {
    const markup = renderToStaticMarkup(
      createElement(ServiceCard, {
        service: {
          ...service,
          provider: {
            ...service.provider!,
            average_rating: 4.8,
            review_count: 9,
          },
        },
      }),
    );
    expect(markup).toContain("4.8");
    expect(markup).toContain("(9)");
  });

  it("shows featured services with a compact provider and price summary", () => {
    const markup = renderToStaticMarkup(
      createElement(ServiceCard, {
        service: {
          ...service,
          indicative_price: { amount: 2500, currency: "INR", unit: "project" },
        },
        layout: "featured",
      }),
    );

    expect(markup).toContain('href="/services/service-id"');
    expect(markup).toContain("Jane Doe");
    expect(markup).toContain("New");
    expect(markup).toContain("₹2,500");
    expect(markup).toContain("per project");
    expect(markup).toContain("aspect-square");
    expect(markup).toContain("Design work for small businesses.");
  });

  it("uses a square image for service grid cards", () => {
    const markup = renderToStaticMarkup(createElement(ServiceCard, { service }));

    expect(markup).toContain("aspect-square");
  });

  it("shows service descriptions in the recommended list layout", () => {
    const markup = renderToStaticMarkup(
      createElement(ServiceCard, {
        service: {
          ...service,
          images: ["https://example.com/service.jpg"],
          indicative_price: {
            amount: 2500.4,
            currency: "INR",
            unit: "project",
          },
          provider: {
            ...service.provider!,
            tagline: "Independent brand designer",
          },
        },
        layout: "list",
      }),
    );

    expect(markup).toContain("aspect-square");
    expect(markup).toContain("object-cover");
    expect(markup).toContain("sm:size-[120px]");
    expect(markup).toContain("Design work for small businesses.");
    expect(markup).toContain("Independent brand designer");
    expect(markup).toContain("₹2,500");
    expect(markup).not.toContain("₹2,500.4");
  });
});
