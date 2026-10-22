import { describe, expect, it } from "vitest";

import {
  buildProfileDescription,
  buildProfileMetadata,
  buildProfileTitle,
} from "@/lib/share-metadata";

const complete = {
  name: "Asha Rao",
  headline: "Actor & Voice Artist",
  url: "https://rootin.app/talent/asha-rao",
  imageUrl: "https://rootin.app/talent/asha-rao/opengraph-image",
};

describe("buildProfileTitle", () => {
  it("leads with the name and the profession", () => {
    expect(buildProfileTitle(complete)).toBe(
      "Asha Rao — Actor & Voice Artist | RootIn",
    );
  });

  it("omits the profession when there is none", () => {
    expect(
      buildProfileTitle({ ...complete, headline: undefined }),
    ).toBe("Asha Rao on RootIn");
  });

  it("falls back to the brand when the profile has no name", () => {
    expect(
      buildProfileTitle({ ...complete, name: "", headline: undefined }),
    ).toBe("RootIn — Talent Profile");
  });

  it("never renders undefined", () => {
    const title = buildProfileTitle({
      ...complete,
      name: "",
      headline: "   ",
    });
    expect(title).not.toContain("undefined");
  });
});

describe("buildProfileDescription", () => {
  it("describes the profile in one concise sentence", () => {
    const description = buildProfileDescription(complete);
    expect(description).toContain("Asha Rao");
    expect(description).toContain("Actor & Voice Artist");
    expect(description).toContain("RootIn");
    expect(description.length).toBeLessThanOrEqual(200);
  });

  it("stays readable for an incomplete profile", () => {
    const description = buildProfileDescription({
      ...complete,
      name: "",
      headline: undefined,
    });
    expect(description).not.toContain("undefined");
    expect(description).not.toContain("''");
    expect(description.length).toBeGreaterThan(0);
  });
});

describe("buildProfileMetadata", () => {
  it("builds Open Graph profile metadata for a complete profile", () => {
    const metadata = buildProfileMetadata(complete);

    expect(metadata.title).toBe("Asha Rao — Actor & Voice Artist | RootIn");
    expect(metadata.openGraph?.type).toBe("profile");
    expect(metadata.openGraph?.url).toBe("https://rootin.app/talent/asha-rao");
    expect(metadata.openGraph?.siteName).toBe("RootIn");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://rootin.app/talent/asha-rao/opengraph-image",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Asha Rao — Actor & Voice Artist | RootIn",
      },
    ]);
    expect(metadata.alternates?.canonical).toBe(
      "https://rootin.app/talent/asha-rao",
    );
  });

  it("builds Twitter card metadata for a complete profile", () => {
    const metadata = buildProfileMetadata(complete);

    expect(metadata.twitter?.card).toBe("summary_large_image");
    expect(metadata.twitter?.title).toBe(
      "Asha Rao — Actor & Voice Artist | RootIn",
    );
    expect(metadata.twitter?.images).toEqual([
      "https://rootin.app/talent/asha-rao/opengraph-image",
    ]);
  });

  it("keeps the metadata valid for an incomplete profile", () => {
    const metadata = buildProfileMetadata({
      name: "",
      headline: undefined,
      url: "https://rootin.app/talent/asha-rao",
      imageUrl: "",
    });

    expect(metadata.title).toBe("RootIn — Talent Profile");
    expect(metadata.description).toBeTruthy();
    expect(metadata.openGraph?.images).toEqual([]);
    expect(metadata.twitter?.images).toEqual([]);
    expect(metadata.openGraph?.url).toBe("https://rootin.app/talent/asha-rao");
  });

  it("never leaks a private field into the metadata", () => {
    const metadata = buildProfileMetadata({
      ...complete,
      name: "Asha Rao",
    });

    const serialized = JSON.stringify(metadata);
    expect(serialized).not.toContain("undefined");
    expect(serialized).not.toContain("full_legal_name");
    expect(serialized).not.toContain("signature");
  });
});
