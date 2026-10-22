import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildCanonicalProfileUrl,
  buildCardShareText,
  buildInstagramCaption,
  buildLinkedInUrl,
  buildProfilePath,
  buildShareMessage,
  buildShareText,
  buildWhatsAppFallbackMessage,
  buildWhatsAppShareFeedback,
  buildWhatsAppUrl,
  canShareFiles,
  canShareFilesSync,
  canShareNative,
  copyTextToClipboard,
  dedupeHashtags,
  isClipboardSupported,
  isNativeShareSupported,
  isSecureContext,
  normalizeOrigin,
  normalizePublicPath,
  planWhatsAppShare,
  roleLabel,
  toAbsoluteUrl,
  WHATSAPP_CARD_FALLBACK_COPY_FAILED_MESSAGE,
  WHATSAPP_CARD_FALLBACK_MESSAGE,
  WHATSAPP_CARD_SHARE_FAILED_MESSAGE,
  WHATSAPP_CARD_SHARED_MESSAGE,
} from "@/lib/share";

const talent = {
  role: "talent" as const,
  slug: "asha-rao",
  name: "Asha Rao",
  headline: "Actor & Voice Artist",
};

const recruiter = {
  role: "recruiter" as const,
  slug: "northlight-casting",
  name: "Northlight Casting",
  headline: "Talent agency",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildProfilePath", () => {
  it("uses the talent route for talent profiles", () => {
    expect(buildProfilePath(talent)).toBe("/talent/asha-rao");
  });

  it("uses the recruiter route for recruiter profiles", () => {
    expect(buildProfilePath(recruiter)).toBe("/recruiter/northlight-casting");
  });

  it("returns an empty path when the slug is missing", () => {
    expect(buildProfilePath({ role: "talent", slug: "" })).toBe("");
    expect(buildProfilePath({ role: "talent", slug: "   " })).toBe("");
  });

  it("encodes the slug so it cannot break out of the path", () => {
    expect(buildProfilePath({ role: "talent", slug: "a b/../c" })).toBe(
      "/talent/a%20b%2F..%2Fc",
    );
  });

  it("prefers an explicit portfolio item path when one is given", () => {
    expect(
      buildProfilePath({
        role: "talent",
        slug: "asha-rao",
        path: "/talent/asha-rao/portfolio?item=abc123",
      }),
    ).toBe("/talent/asha-rao/portfolio?item=abc123");
  });

  it("ignores an explicit path that is not root relative", () => {
    expect(
      buildProfilePath({
        role: "talent",
        slug: "asha-rao",
        path: "https://evil.example/talent/asha-rao",
      }),
    ).toBe("/talent/asha-rao");
  });
});

describe("normalizePublicPath", () => {
  it("keeps root relative paths", () => {
    expect(normalizePublicPath("/talent/asha-rao")).toBe("/talent/asha-rao");
  });

  it("rejects absolute and protocol relative paths", () => {
    expect(normalizePublicPath("https://evil.example")).toBe("");
    expect(normalizePublicPath("//evil.example/talent")).toBe("");
    expect(normalizePublicPath("/\\evil.example")).toBe("");
    expect(normalizePublicPath("talent/asha-rao")).toBe("");
    expect(normalizePublicPath(undefined)).toBe("");
  });
});

describe("buildCanonicalProfileUrl", () => {
  it("builds an absolute URL from the origin and the canonical path", () => {
    expect(
      buildCanonicalProfileUrl(talent, "https://rootin.app"),
    ).toBe("https://rootin.app/talent/asha-rao");
  });

  it("strips trailing slashes from the origin", () => {
    expect(
      buildCanonicalProfileUrl(talent, "https://rootin.app///"),
    ).toBe("https://rootin.app/talent/asha-rao");
  });

  it("returns an empty URL when no origin is available", () => {
    expect(buildCanonicalProfileUrl(talent)).toBe("");
    expect(buildCanonicalProfileUrl(talent, "")).toBe("");
    expect(buildCanonicalProfileUrl(talent, "not a url")).toBe("");
  });

  it("returns an empty URL when the profile has no slug", () => {
    expect(buildCanonicalProfileUrl({ role: "recruiter", slug: "" })).toBe("");
  });

  it("never carries query parameters", () => {
    const url = buildCanonicalProfileUrl(talent, "https://rootin.app");
    expect(url).not.toContain("?");
    expect(url).not.toContain("#");
  });

  it("builds the explicit portfolio item URL when one is requested", () => {
    expect(
      buildCanonicalProfileUrl(
        {
          role: "talent",
          slug: "asha-rao",
          path: "/talent/asha-rao/portfolio?item=abc123",
        },
        "https://rootin.app",
      ),
    ).toBe("https://rootin.app/talent/asha-rao/portfolio?item=abc123");
  });
});

describe("normalizeOrigin", () => {
  it("keeps the origin without a trailing slash", () => {
    expect(normalizeOrigin("https://rootin.app/")).toBe("https://rootin.app");
  });

  it("returns an empty string for an empty or invalid value", () => {
    expect(normalizeOrigin("  ")).toBe("");
    expect(normalizeOrigin(null)).toBe("");
    expect(normalizeOrigin("ftp://rootin.app")).toBe("");
  });
});

describe("share messages", () => {
  it("mentions the name, the role and the brand", () => {
    expect(buildShareText(talent)).toBe(
      "Check out Asha Rao · Actor & Voice Artist on RootIn ✨",
    );
  });

  it("omits the headline when there is none", () => {
    expect(buildShareText({ role: "talent", slug: "x", name: "Sam" })).toBe(
      "Check out Sam's portfolio on RootIn ✨",
    );
  });

  it("uses a generic name when the profile has no display name", () => {
    expect(buildShareText({ role: "recruiter", slug: "x", name: "" })).toBe(
      "Check out a recruiter's portfolio on RootIn ✨",
    );
  });

  it("builds a professional WhatsApp message with the name, the profession and the link", () => {
    expect(
      buildShareMessage(talent, "https://rootin.app/talent/asha-rao"),
    ).toBe(
      [
        "Hey! Check out Asha Rao's creative portfolio on RootIn ✨",
        "",
        "Actor & Voice Artist",
        "",
        "View full portfolio, verified work & credits:",
        "https://rootin.app/talent/asha-rao",
      ].join("\n"),
    );
  });

  it("never renders undefined for a missing name or profession", () => {
    const message = buildShareMessage(
      { role: "talent", slug: "x", name: "" },
      "https://rootin.app/talent/x",
    );

    expect(message).not.toContain("undefined");
    expect(message).not.toContain("null");
    expect(message).toContain("Hey! Check out this creative portfolio on RootIn ✨");
    expect(message).not.toContain("\n\n\n");
  });

  it("omits the link block when there is no URL", () => {
    const message = buildShareMessage(talent, "");
    expect(message).toContain("Hey! Check out Asha Rao's creative portfolio on RootIn ✨");
    expect(message).not.toContain("View full portfolio, verified work & credits:");
  });
});

describe("instagram caption", () => {
  it("contains the name, the profession, the canonical URL and the hashtags", () => {
    const caption = buildInstagramCaption(
      talent,
      "https://rootin.app/talent/asha-rao",
    );

    expect(caption).toContain("Meet Asha Rao ✨");
    expect(caption).toContain("Actor & Voice Artist");
    expect(caption).toContain("Discover more: https://rootin.app/talent/asha-rao");
    expect(caption).toContain("#RootIn");
    expect(caption).toContain("#TalentPortfolio");
  });

  it("never renders placeholders for missing fields", () => {
    const caption = buildInstagramCaption(
      { role: "talent", slug: "x", name: "" },
      "",
    );

    expect(caption).not.toContain("undefined");
    expect(caption).not.toContain("null");
    expect(caption).toContain("Meet this talent ✨");
    expect(caption).not.toContain("Discover more:");
  });

  it("does not repeat a hashtag that already appears in the caption", () => {
    const caption = buildInstagramCaption(
      { role: "talent", slug: "x", name: "Sam", headline: "#RootIn fan" },
      "https://rootin.app/talent/x",
    );

    expect(caption.match(/#RootIn/g)?.length).toBe(1);
  });
});

describe("dedupeHashtags", () => {
  it("removes repeated hashtags but keeps the order", () => {
    expect(dedupeHashtags("#A #B\n#A #c")).toBe("#A #B\n#c");
  });

  it("leaves text without hashtags untouched", () => {
    expect(dedupeHashtags("Meet Asha Rao ✨")).toBe("Meet Asha Rao ✨");
  });
});

describe("destination links", () => {
  it("builds a WhatsApp link with a prefilled message and the canonical URL", () => {
    const url = buildWhatsAppUrl(talent, "https://rootin.app/talent/asha-rao");
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);

    const message = decodeURIComponent(url.split("text=")[1]);
    expect(message).toContain("Asha Rao");
    expect(message).toContain("Actor & Voice Artist");
    expect(message).toContain("https://rootin.app/talent/asha-rao");
  });

  it("encodes the WhatsApp message so the link stays a single parameter", () => {
    const url = buildWhatsAppUrl(talent, "https://rootin.app/talent/asha-rao");
    expect(url).not.toContain(" ");
    expect(url).not.toContain("\n");
    expect(url).toContain("%0A");
  });

  it("builds a LinkedIn share link carrying only the canonical URL", () => {
    const url = buildLinkedInUrl("https://rootin.app/talent/asha-rao");
    expect(url).toBe(
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Frootin.app%2Ftalent%2Fasha-rao",
    );
  });
});

describe("whatsapp fallback message", () => {
  it("claims the link was copied only when the clipboard took it", () => {
    expect(buildWhatsAppFallbackMessage(true)).toBe(WHATSAPP_CARD_FALLBACK_MESSAGE);
    expect(buildWhatsAppFallbackMessage(true)).toContain("link copied");
  });

  it("asks for a manual copy when the clipboard refused the link", () => {
    const message = buildWhatsAppFallbackMessage(false);

    expect(message).toBe(WHATSAPP_CARD_FALLBACK_COPY_FAILED_MESSAGE);
    expect(message).not.toContain("link copied");
    expect(message.toLowerCase()).toContain("copy the profile link");
  });
});

describe("whatsapp share feedback", () => {
  it("offers the link for copying after a card share", () => {
    const feedback = buildWhatsAppShareFeedback("shared");

    expect(feedback.offerCopy).toBe(true);
    expect(feedback.useFallback).toBe(false);
    expect(feedback.isError).toBe(false);
    expect(feedback.message).toBe(WHATSAPP_CARD_SHARED_MESSAGE);
  });

  it("never claims that the message text was delivered", () => {
    const feedback = buildWhatsAppShareFeedback("shared");

    expect(feedback.message).not.toMatch(/message (was |has been )?sent/i);
    expect(feedback.message).not.toMatch(/caption (was |has been )?sent/i);
    expect(feedback.message).not.toMatch(/link (was |has been )?(sent|included|added)/i);
    expect(feedback.message).not.toMatch(/success/i);
    // It points at the copy action instead.
    expect(feedback.message.toLowerCase()).toContain("copy");
  });

  it("says nothing when the user cancelled the share sheet", () => {
    const feedback = buildWhatsAppShareFeedback("cancelled");

    expect(feedback.message).toBe("");
    expect(feedback.isError).toBe(false);
    expect(feedback.offerCopy).toBe(false);
    expect(feedback.useFallback).toBe(false);
  });

  it("falls back to the download hand-off when files cannot be shared", () => {
    const feedback = buildWhatsAppShareFeedback("unsupported");

    expect(feedback.useFallback).toBe(true);
    expect(feedback.offerCopy).toBe(false);
    expect(feedback.isError).toBe(false);
  });

  it("reports a genuine failure without opening another share flow", () => {
    const feedback = buildWhatsAppShareFeedback("failed");

    expect(feedback.isError).toBe(true);
    expect(feedback.useFallback).toBe(false);
    expect(feedback.offerCopy).toBe(true);
    expect(feedback.message).toBe(WHATSAPP_CARD_SHARE_FAILED_MESSAGE);
  });

  it("keeps every message free of a URL and of personal data", () => {
    for (const result of ["shared", "failed", "unsupported", "cancelled"] as const) {
      const { message } = buildWhatsAppShareFeedback(result);
      expect(message).not.toMatch(/https?:\/\//);
      expect(message).not.toMatch(/localhost|127\.0\.0\.1/i);
      expect(message).not.toContain("Asha Rao");
    }
  });
});

describe("card share text", () => {
  it("keeps the message short and ends with the canonical URL", () => {
    const text = buildCardShareText(talent, "https://rootin.app/talent/asha-rao");
    const lines = text.split("\n");

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("Check out Asha Rao · Actor & Voice Artist on RootIn ✨");
    expect(lines[1]).toBe("https://rootin.app/talent/asha-rao");
  });

  it("omits the link when there is no canonical URL", () => {
    expect(buildCardShareText(talent, "")).toBe(
      "Check out Asha Rao · Actor & Voice Artist on RootIn ✨",
    );
  });

  it("never leaks a placeholder when the profile has no name", () => {
    const text = buildCardShareText(
      { role: "talent", slug: "asha-rao", name: "" },
      "https://rootin.app/talent/asha-rao",
    );
    expect(text).not.toContain("undefined");
    expect(text).toContain("https://rootin.app/talent/asha-rao");
  });
});

describe("whatsapp share plan", () => {
  const url = "https://rootin.app/talent/asha-rao";

  it("attaches the card through the native sheet when files can be shared", () => {
    const plan = planWhatsAppShare({
      target: talent,
      url,
      canShareFiles: true,
    });

    expect(plan.mode).toBe("file");
    expect(plan.title).toBe("Asha Rao on RootIn");
    expect(plan.text).toContain(url);
    expect(plan.text.split("\n")).toHaveLength(2);
  });

  it("falls back to a link when the browser cannot share files", () => {
    const plan = planWhatsAppShare({
      target: talent,
      url,
      canShareFiles: false,
    });

    expect(plan.mode).toBe("link");
    expect(plan.link.startsWith("https://wa.me/?text=")).toBe(true);

    const message = decodeURIComponent(plan.link.split("text=")[1]);
    expect(message).toContain("Asha Rao");
    expect(message).toContain(url);
  });

  it("keeps the fallback link free of a local address", () => {
    const plan = planWhatsAppShare({
      target: talent,
      url: "https://rootin.app/talent/asha-rao",
      canShareFiles: false,
    });

    expect(plan.link).not.toContain("localhost");
    expect(plan.link).not.toContain("127.0.0.1");
  });

  it("uses a neutral title when the profile has no name", () => {
    const plan = planWhatsAppShare({
      target: { role: "talent", slug: "asha-rao", name: "" },
      url,
      canShareFiles: true,
    });

    expect(plan.title).toBe("a talent on RootIn");
  });
});

describe("share capability detection", () => {
  it("reports no native share support when navigator.share is missing", () => {
    vi.stubGlobal("navigator", {});
    expect(isNativeShareSupported()).toBe(false);
  });

  it("reports native share support when navigator.share exists", () => {
    vi.stubGlobal("navigator", { share: vi.fn() });
    expect(isNativeShareSupported()).toBe(true);
  });

  it("uses navigator.canShare when it is available", () => {
    const canShare = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { share: vi.fn(), canShare });
    expect(canShareNative({ url: "https://rootin.app" })).toBe(true);
    expect(canShare).toHaveBeenCalledWith({ url: "https://rootin.app" });
  });

  it("returns false when navigator.canShare throws", () => {
    vi.stubGlobal("navigator", {
      share: vi.fn(),
      canShare: () => {
        throw new Error("nope");
      },
    });
    expect(canShareNative({ url: "https://rootin.app" })).toBe(false);
  });

  it("never claims file sharing support without navigator.canShare", () => {
    vi.stubGlobal("navigator", { share: vi.fn() });
    expect(canShareFiles([])).toBe(false);
  });

  it("delegates file sharing to navigator.canShare", () => {
    const canShare = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { share: vi.fn(), canShare });
    const file = { name: "card.png" } as File;
    expect(canShareFiles([file])).toBe(true);
  });

  it("probes file sharing support synchronously", async () => {
    const canShare = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { share: vi.fn(), canShare });

    expect(canShareFilesSync()).toBe(true);
    expect(canShare).toHaveBeenCalledTimes(1);

    const payload = canShare.mock.calls[0][0] as { files: File[] };
    expect(payload.files).toHaveLength(1);
    expect(payload.files[0].type).toBe("image/png");
    expect(payload.files[0].name).toBe("rootin-talent-profile.png");
    expect(payload.files[0].size).toBeGreaterThan(0);

    // A real PNG signature — the probe must look like the card it stands in for.
    const bytes = new Uint8Array(await payload.files[0].arrayBuffer());
    expect(Array.from(bytes.slice(0, 8))).toEqual([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
  });

  it("never claims synchronous file sharing support without navigator.share", () => {
    vi.stubGlobal("navigator", { canShare: vi.fn().mockReturnValue(true) });
    expect(canShareFilesSync()).toBe(false);
  });

  it("never claims synchronous file sharing support without navigator.canShare", () => {
    vi.stubGlobal("navigator", { share: vi.fn() });
    expect(canShareFilesSync()).toBe(false);
  });

  it("reports no synchronous file sharing support when canShare throws", () => {
    vi.stubGlobal("navigator", {
      share: vi.fn(),
      canShare: () => {
        throw new Error("nope");
      },
    });
    expect(canShareFilesSync()).toBe(false);
  });

  it("detects clipboard support", () => {
    vi.stubGlobal("navigator", {});
    expect(isClipboardSupported()).toBe(false);

    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() } });
    expect(isClipboardSupported()).toBe(true);
  });

  it("treats a server environment as a secure context", () => {
    vi.unstubAllGlobals();
    expect(isSecureContext()).toBe(true);
  });

  it("reads isSecureContext from the window", () => {
    vi.stubGlobal("window", { isSecureContext: false });
    expect(isSecureContext()).toBe(false);
  });
});

describe("copyTextToClipboard", () => {
  it("uses the async clipboard API when it is available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await expect(copyTextToClipboard("https://rootin.app")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("https://rootin.app");
  });

  it("reports a failure when the clipboard rejects the write", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    vi.stubGlobal("document", undefined);

    await expect(copyTextToClipboard("https://rootin.app")).resolves.toBe(false);
  });
});

describe("helpers", () => {
  it("labels the roles", () => {
    expect(roleLabel("talent")).toBe("Talent");
    expect(roleLabel("recruiter")).toBe("Recruiter");
  });

  it("makes relative image URLs absolute", () => {
    expect(toAbsoluteUrl("/uploads/photo.png", "https://rootin.app")).toBe(
      "https://rootin.app/uploads/photo.png",
    );
  });

  it("keeps absolute image URLs untouched", () => {
    expect(
      toAbsoluteUrl("https://cdn.rootin.app/photo.png", "https://rootin.app"),
    ).toBe("https://cdn.rootin.app/photo.png");
  });

  it("returns an empty string for a missing image", () => {
    expect(toAbsoluteUrl(undefined, "https://rootin.app")).toBe("");
  });

  it("returns an empty string for a relative image without an origin", () => {
    expect(toAbsoluteUrl("/uploads/photo.png")).toBe("");
  });
});
