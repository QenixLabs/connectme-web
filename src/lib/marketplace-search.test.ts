import { describe, expect, it } from "vitest";
import {
  readProviderDirectoryFilters,
  readServiceSearchFilters,
  updateMarketplaceSearchParams,
} from "@/lib/marketplace-search";

describe("marketplace search URL state", () => {
  it("normalizes provider filters and bounds shared-link pagination", () => {
    expect(
      readProviderDirectoryFilters(
        new URLSearchParams(
          "search=%20designer%20&category=Design&location=Pune&min_rating=4&sort=highest_rating&page=50000",
        ),
      ),
    ).toEqual({
      search: "designer",
      category: "Design",
      location: "Pune",
      min_rating: 4,
      sort: "highest_rating",
      page: 10000,
      limit: 12,
    });
  });

  it("ignores invalid provider sort and rating parameters", () => {
    expect(
      readProviderDirectoryFilters(
        new URLSearchParams("sort=internal_field&min_rating=8&page=-1"),
      ),
    ).toMatchObject({
      sort: "relevance",
      min_rating: undefined,
      page: 1,
    });
  });

  it("parses service price, currency, rating, and sort filters", () => {
    expect(
      readServiceSearchFilters(
        new URLSearchParams(
          "min_price=100&max_price=500&currency=usd&min_rating=3&sort=price_low&page=2",
        ),
      ),
    ).toMatchObject({
      min_price: 100,
      max_price: 500,
      currency: "USD",
      min_rating: 3,
      sort: "price_low",
      page: 2,
    });
  });

  it("omits malformed numeric and currency values", () => {
    expect(
      readServiceSearchFilters(
        new URLSearchParams("min_price=-3&max_price=1000000001&currency=US&min_rating=0"),
      ),
    ).toMatchObject({
      min_price: undefined,
      max_price: undefined,
      currency: undefined,
      min_rating: undefined,
    });
  });

  it("patches shareable parameters, clears values, and resets pagination", () => {
    const updated = updateMarketplaceSearchParams(
      new URLSearchParams("search=old&category=Design&page=4&keep=yes"),
      { search: "new term", category: undefined },
    );
    expect(updated.toString()).toBe("search=new+term&keep=yes");
  });

  it("preserves pagination when moving between result pages", () => {
    const updated = updateMarketplaceSearchParams(
      new URLSearchParams("search=designer&page=3"),
      { page: "4" },
      false,
    );
    expect(updated.toString()).toBe("search=designer&page=4");
  });
});
