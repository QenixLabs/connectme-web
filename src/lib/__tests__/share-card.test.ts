import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildHandleLabel,
  buildQrMatrix,
  buildShareCardContent,
  buildShortLinkLabel,
  downloadBlob,
  isCanvasTainted,
  loadImageForCanvas,
  SHARE_CARD_HEIGHT,
  SHARE_CARD_LAYOUT,
  SHARE_CARD_SAFE_MARGIN,
  SHARE_CARD_WIDTH,
  shareCardFileName,
  truncateToWidth,
} from "@/lib/share-card";

const talent = {
  role: "talent" as const,
  slug: "asha-rao",
  name: "Asha Rao",
  headline: "Actor & Voice Artist",
  isVerified: true,
};

const CANONICAL_URL = "https://rootin.app/talent/asha-rao";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildShareCardContent", () => {
  it("uses the display name, the headline and the canonical URL", () => {
    const content = buildShareCardContent({
      target: talent,
      url: CANONICAL_URL,
    });

    expect(content.name).toBe("Asha Rao");
    expect(content.headline).toBe("Actor & Voice Artist");
    expect(content.url).toBe(CANONICAL_URL);
    expect(content.initials).toBe("AR");
    expect(content.isVerified).toBe(true);
    expect(content.brand).toBe("RootIn");
  });

  it("falls back to the role when there is no headline", () => {
    const content = buildShareCardContent({
      target: { role: "recruiter", slug: "northlight", name: "Northlight" },
    });
    expect(content.headline).toBe("Recruiter");
    expect(content.roleLabel).toBe("Recruiter");
  });

  it("derives the URL from the target when none is given", () => {
    const content = buildShareCardContent({
      target: talent,
      origin: "https://rootin.app",
    });
    expect(content.url).toBe(CANONICAL_URL);
  });

  it("never leaks the verification badge for an unverified profile", () => {
    const content = buildShareCardContent({
      target: { ...talent, isVerified: false },
    });
    expect(content.isVerified).toBe(false);
  });

  it("shows a short label instead of the raw URL", () => {
    const content = buildShareCardContent({
      target: talent,
      url: CANONICAL_URL,
    });

    expect(content.shortUrl).toBe("rootin.app/talent/asha-rao");
    expect(content.shortUrl).not.toContain("https://");
    expect(content.handle).toBe("@asha-rao");
  });
});

describe("buildShortLinkLabel", () => {
  it("drops the protocol and keeps the host and the path", () => {
    expect(buildShortLinkLabel(CANONICAL_URL)).toBe("rootin.app/talent/asha-rao");
  });

  it("keeps the host when there is no path", () => {
    expect(buildShortLinkLabel("https://rootin.app")).toBe("rootin.app");
  });

  it("returns an empty string for an empty URL", () => {
    expect(buildShortLinkLabel("")).toBe("");
  });
});

describe("buildHandleLabel", () => {
  it("prefixes the slug with an @", () => {
    expect(buildHandleLabel("asha-rao")).toBe("@asha-rao");
  });

  it("returns an empty string for a missing slug", () => {
    expect(buildHandleLabel("  ")).toBe("");
  });
});

describe("buildQrMatrix", () => {
  it("returns a square matrix", () => {
    const matrix = buildQrMatrix(CANONICAL_URL);
    expect(matrix).not.toBeNull();
    expect(matrix!.count).toBeGreaterThan(0);
    expect(matrix!.modules.length).toBe(matrix!.count);
    matrix!.modules.forEach((row) => expect(row.length).toBe(matrix!.count));
  });

  it("encodes the exact canonical URL", () => {
    const canonical = buildQrMatrix(CANONICAL_URL);
    const other = buildQrMatrix("https://rootin.app/talent/someone-else");

    expect(canonical).not.toBeNull();
    expect(canonical!.modules).not.toEqual(other!.modules);
  });

  it("draws the three finder patterns", () => {
    const matrix = buildQrMatrix(CANONICAL_URL);
    expect(matrix).not.toBeNull();
    const { modules, count } = matrix!;

    // A finder pattern is a 7x7 block: dark outer ring, light ring, dark core.
    const isFinder = (top: number, left: number) =>
      modules[top][left] === true &&
      modules[top + 1][left + 1] === false &&
      modules[top + 3][left + 3] === true;

    expect(isFinder(0, 0)).toBe(true);
    expect(isFinder(0, count - 7)).toBe(true);
    expect(isFinder(count - 7, 0)).toBe(true);
  });

  it("returns null for an empty payload", () => {
    expect(buildQrMatrix("")).toBeNull();
  });

  it("keeps the modules large enough to be scannable on the card", () => {
    const matrix = buildQrMatrix(CANONICAL_URL)!;
    // The QR is drawn with a quiet zone of two modules on each side.
    const cells = matrix.count + 4;
    const cellSize = SHARE_CARD_LAYOUT.qr.size / cells;
    expect(cellSize).toBeGreaterThanOrEqual(4);
  });
});

describe("share card layout", () => {
  const layout = SHARE_CARD_LAYOUT;

  it("uses a portrait format that fits Instagram", () => {
    expect(SHARE_CARD_WIDTH).toBe(1080);
    expect(SHARE_CARD_HEIGHT).toBe(1350);
  });

  it("keeps every element inside the canvas", () => {
    const boxes = {
      header: {
        top: layout.header.markY - layout.header.markRadius,
        bottom: layout.header.markY + layout.header.markRadius,
        left: layout.header.markX - layout.header.markRadius,
        right: layout.header.labelRight,
      },
      portrait: {
        top: layout.portrait.centerY - layout.portrait.radius,
        bottom: layout.portrait.centerY + layout.portrait.radius,
        left: layout.portrait.centerX - layout.portrait.radius,
        right: layout.portrait.centerX + layout.portrait.radius,
      },
      name: {
        top: layout.name.y - layout.name.fontSize / 2,
        bottom: layout.name.y + layout.name.fontSize / 2,
        left: 0,
        right: SHARE_CARD_WIDTH,
      },
      headline: {
        top: layout.headline.y - layout.headline.fontSize / 2,
        bottom: layout.headline.y + layout.headline.fontSize / 2,
        left: 0,
        right: SHARE_CARD_WIDTH,
      },
      badge: {
        top: layout.badge.y,
        bottom: layout.badge.y + layout.badge.height,
        left: 0,
        right: SHARE_CARD_WIDTH,
      },
      cta: {
        top: layout.cta.y,
        bottom: layout.cta.y + layout.cta.height,
        left: 0,
        right: SHARE_CARD_WIDTH,
      },
      panel: {
        top: layout.panel.y,
        bottom: layout.panel.y + layout.panel.height,
        left: layout.panel.x,
        right: layout.panel.x + layout.panel.width,
      },
      footer: {
        top: layout.footer.y - layout.footer.fontSize / 2,
        bottom: layout.footer.y + layout.footer.fontSize / 2,
        left: layout.footer.x,
        right: layout.footer.right,
      },
    };

    for (const [name, box] of Object.entries(boxes)) {
      expect(box.top, `${name} top`).toBeGreaterThanOrEqual(0);
      expect(box.bottom, `${name} bottom`).toBeLessThanOrEqual(SHARE_CARD_HEIGHT);
      expect(box.left, `${name} left`).toBeGreaterThanOrEqual(0);
      expect(box.right, `${name} right`).toBeLessThanOrEqual(SHARE_CARD_WIDTH);
    }
  });

  it("keeps the content inside the safe margins", () => {
    const layoutBounds = {
      panelLeft: layout.panel.x,
      panelRight: layout.panel.x + layout.panel.width,
      footerLeft: layout.footer.x,
      footerRight: layout.footer.right,
      footerBottom: layout.footer.y + layout.footer.fontSize / 2,
    };

    expect(layoutBounds.panelLeft).toBeGreaterThanOrEqual(SHARE_CARD_SAFE_MARGIN);
    expect(SHARE_CARD_WIDTH - layoutBounds.panelRight).toBeGreaterThanOrEqual(
      SHARE_CARD_SAFE_MARGIN,
    );
    expect(layoutBounds.footerLeft).toBeGreaterThanOrEqual(
      SHARE_CARD_SAFE_MARGIN,
    );
    expect(SHARE_CARD_WIDTH - layoutBounds.footerRight).toBeGreaterThanOrEqual(
      SHARE_CARD_SAFE_MARGIN,
    );
    expect(SHARE_CARD_HEIGHT - layoutBounds.footerBottom).toBeGreaterThanOrEqual(
      SHARE_CARD_SAFE_MARGIN,
    );
  });

  it("does not clip the QR code or the footer", () => {
    const qrTop = layout.panel.y + (layout.panel.height - layout.qr.size) / 2;
    const qrBottom = qrTop + layout.qr.size;
    const qrLeft = layout.panel.x + layout.panel.width - 40 - layout.qr.size;
    const qrRight = qrLeft + layout.qr.size;

    expect(qrTop).toBeGreaterThan(layout.panel.y);
    expect(qrBottom).toBeLessThan(layout.panel.y + layout.panel.height);
    expect(qrRight).toBeLessThan(layout.panel.x + layout.panel.width);
    expect(qrBottom).toBeLessThan(layout.footer.y);
  });

  it("keeps the vertical rhythm free of overlaps", () => {
    const portraitBottom =
      layout.portrait.centerY + layout.portrait.radius + layout.portrait.ringGap;
    expect(layout.name.y - layout.name.fontSize / 2).toBeGreaterThan(
      portraitBottom,
    );

    expect(layout.headline.y - layout.headline.fontSize / 2).toBeGreaterThan(
      layout.name.y + layout.name.fontSize / 2,
    );
    expect(layout.badge.y).toBeGreaterThan(
      layout.headline.y + layout.headline.fontSize / 2,
    );
    expect(layout.cta.y).toBeGreaterThan(
      layout.badge.y + layout.badge.height,
    );
    expect(layout.panel.y).toBeGreaterThan(
      layout.cta.y + layout.cta.height,
    );
    expect(layout.footer.y - layout.footer.fontSize / 2).toBeGreaterThan(
      layout.panel.y + layout.panel.height,
    );
  });
});

describe("shareCardFileName", () => {
  it("uses the shared card name for a talent profile", () => {
    expect(shareCardFileName(talent)).toBe("rootin-talent-profile.png");
  });

  it("uses the recruiter variant for a recruiter profile", () => {
    expect(
      shareCardFileName({ role: "recruiter", slug: "north-talent", name: "" }),
    ).toBe("rootin-recruiter-profile.png");
  });

  it("never leaks the slug or an unsafe character into the file name", () => {
    const name = shareCardFileName({
      role: "talent",
      slug: "Asha Rao / Photos",
      name: "",
    });
    expect(name).toBe("rootin-talent-profile.png");
    expect(name).not.toMatch(/[\\/:*?"<>|]/);
  });
});

describe("downloadBlob", () => {
  it("refuses to download an empty card", () => {
    expect(() =>
      downloadBlob(new Blob([], { type: "image/png" }), "card.png"),
    ).toThrow(/empty/i);
  });

  it("accepts a rendered PNG", () => {
    const png = new Blob([new Uint8Array([137, 80, 78, 71])], {
      type: "image/png",
    });
    // Without a DOM there is nothing to click — the call must not throw.
    expect(() => downloadBlob(png, "card.png")).not.toThrow();
  });
});

describe("canvas tainting", () => {
  it("detects a tainted canvas", () => {
    const context = {
      getImageData: () => {
        throw new Error("SecurityError");
      },
    } as unknown as CanvasRenderingContext2D;

    expect(isCanvasTainted(context)).toBe(true);
  });

  it("reports a clean canvas", () => {
    const context = {
      getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    } as unknown as CanvasRenderingContext2D;

    expect(isCanvasTainted(context)).toBe(false);
  });
});

describe("loadImageForCanvas", () => {
  it("returns null when there is no browser", async () => {
    await expect(loadImageForCanvas(CANONICAL_URL)).resolves.toBeNull();
  });

  it("returns null when the image fails to load", async () => {
    class FailingImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      crossOrigin = "";
      naturalWidth = 0;
      naturalHeight = 0;
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }

    vi.stubGlobal("window", {});
    vi.stubGlobal("Image", FailingImage);

    await expect(loadImageForCanvas(CANONICAL_URL)).resolves.toBeNull();
  });

  it("returns null for an empty source", async () => {
    await expect(loadImageForCanvas("")).resolves.toBeNull();
  });
});

describe("truncateToWidth", () => {
  const context = {
    measureText: (text: string) => ({ width: text.length * 10 }),
  } as unknown as CanvasRenderingContext2D;

  it("keeps text that already fits", () => {
    expect(truncateToWidth(context, "abcd", 100)).toBe("abcd");
  });

  it("truncates text that is too long", () => {
    const result = truncateToWidth(context, "abcdefghij", 50);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThan("abcdefghij".length);
  });
});
