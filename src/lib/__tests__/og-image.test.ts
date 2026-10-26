import { describe, expect, it } from "vitest";

import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_MAX_BYTES,
  OG_IMAGE_WIDTH,
  buildTalentOgImagePath,
  buildTalentOgImageUrl,
  buildTalentOgImageVersion,
  talentPhotoIdentity,
} from "@/lib/og-image";
import { buildProfileMetadata } from "@/lib/share-metadata";

describe("talent OG image constants", () => {
  it("uses the exact landscape dimensions WhatsApp requires", () => {
    expect(OG_IMAGE_WIDTH).toBe(1200);
    expect(OG_IMAGE_HEIGHT).toBe(630);
    expect(OG_IMAGE_WIDTH / OG_IMAGE_HEIGHT).toBeCloseTo(1.9048, 3);
  });

  it("keeps a margin below 250 kB", () => {
    expect(OG_IMAGE_MAX_BYTES).toBe(250_000);
    expect(OG_IMAGE_CONTENT_TYPE).toBe("image/jpeg");
  });
});

describe("buildTalentOgImagePath", () => {
  it("encodes the username into a public path", () => {
    expect(buildTalentOgImagePath("asha rao")).toBe(
      "/api/og/talent/asha%20rao",
    );
  });

  it("rejects an empty username", () => {
    expect(buildTalentOgImagePath("   ")).toBe("");
  });
});

describe("buildTalentOgImageUrl", () => {
  it("returns an absolute, cache-busted URL", () => {
    expect(
      buildTalentOgImageUrl({
        origin: "https://rootin.app/",
        slug: "asha-rao",
        version: "abc123",
      }),
    ).toBe("https://rootin.app/api/og/talent/asha-rao?v=abc123");
  });

  it("omits the version when it is missing", () => {
    expect(
      buildTalentOgImageUrl({
        origin: "https://rootin.app",
        slug: "asha-rao",
        version: "",
      }),
    ).toBe("https://rootin.app/api/og/talent/asha-rao");
  });

  it("returns an empty string without a usable origin", () => {
    expect(
      buildTalentOgImageUrl({ origin: "not-a-url", slug: "asha-rao" }),
    ).toBe("");
  });
});

describe("talentPhotoIdentity", () => {
  it("ignores expiring signature parameters but keeps the file path", () => {
    expect(
      talentPhotoIdentity(
        "https://api.rootin.app/files/access?path=avatars%2Fasha.jpg&expires=1&signature=aaa",
      ),
    ).toBe(
      "https://api.rootin.app/files/access?path=avatars%2Fasha.jpg",
    );
  });
});

describe("buildTalentOgImageVersion", () => {
  const photo =
    "https://api.rootin.app/files/access?path=avatars%2Fasha.jpg&expires=1770000000&signature=aaa";

  it("stays stable while only the signature rotates", () => {
    const rotated =
      "https://api.rootin.app/files/access?path=avatars%2Fasha.jpg&expires=1779999999&signature=bbb";

    expect(
      buildTalentOgImageVersion({ profilePhoto: photo, updatedAt: "2026-01-01" }),
    ).toBe(
      buildTalentOgImageVersion({
        profilePhoto: rotated,
        updatedAt: "2026-01-01",
      }),
    );
  });

  it("changes when the profile picture is replaced", () => {
    expect(
      buildTalentOgImageVersion({
        profilePhoto: photo,
        updatedAt: "2026-01-01",
      }),
    ).not.toBe(
      buildTalentOgImageVersion({
        profilePhoto: photo.replace("asha.jpg", "asha-new.jpg"),
        updatedAt: "2026-01-01",
      }),
    );
  });

  it("changes when the profile update timestamp changes", () => {
    expect(
      buildTalentOgImageVersion({
        profilePhoto: photo,
        updatedAt: "2026-01-01",
      }),
    ).not.toBe(
      buildTalentOgImageVersion({
        profilePhoto: photo,
        updatedAt: "2026-02-01",
      }),
    );
  });

  it("produces a short, URL-safe hash", () => {
    const version = buildTalentOgImageVersion({
      profilePhoto: photo,
      updatedAt: "2026-01-01",
    });

    expect(version).toMatch(/^[a-f0-9]{16}$/);
  });
});

describe("buildProfileMetadata with the rendered OG image", () => {
  it("emits the exact dimensions and the JPEG MIME type", () => {
    const metadata = buildProfileMetadata({
      name: "Asha Rao",
      headline: "Actor",
      url: "https://rootin.app/talent/asha-rao",
      imageUrl:
        "https://rootin.app/api/og/talent/asha-rao?v=abc123",
      imageWidth: OG_IMAGE_WIDTH,
      imageHeight: OG_IMAGE_HEIGHT,
      imageType: OG_IMAGE_CONTENT_TYPE,
    });

    expect(metadata.openGraph.images).toEqual([
      {
        url: "https://rootin.app/api/og/talent/asha-rao?v=abc123",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Asha Rao — Actor | RootIn",
      },
    ]);
  });
});
