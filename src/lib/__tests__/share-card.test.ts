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
    // Four light modules on each side form the QR code's standard quiet zone.
    const cells = matrix.count + 8;
    const cellSize = SHARE_CARD_LAYOUT.qr.codeSize / cells;
    expect(cellSize).toBeGreaterThanOrEqual(2.5);
  });
});

describe("share card layout", () => {
  const layout = SHARE_CARD_LAYOUT;

  it("uses the creative template portrait format", () => {
    expect(SHARE_CARD_WIDTH).toBe(682);
    expect(SHARE_CARD_HEIGHT).toBe(1024);
  });

  it("enlarges the portrait and QR while preserving their placement", () => {
    expect(layout.portrait.radius).toBeGreaterThanOrEqual(145 * 1.2);
    expect(layout.qr.size).toBeGreaterThanOrEqual(102 * 1.3);
    expect(layout.qr.codeSize).toBeLessThan(layout.qr.size);
    expect(layout.header.badgeX + layout.header.badgeWidth).toBeLessThan(
      layout.portrait.centerX - layout.portrait.radius,
    );
  });

  it("keeps every element inside the canvas", () => {
    const boxes = {
      header: {
        top: layout.header.badgeY,
        bottom: layout.header.badgeY + layout.header.badgeHeight,
        left: layout.header.badgeX,
        right: layout.header.badgeX + layout.header.badgeWidth,
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
      pills: {
        top: layout.pills.y,
        bottom: layout.pills.y + layout.pills.height,
        left: 0,
        right: SHARE_CARD_WIDTH,
      },
      stats: {
        top: layout.stats.dividerY1,
        bottom: layout.stats.dividerY2,
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
    const qrTop = layout.qr.y;
    const qrBottom = qrTop + layout.qr.size;
    const qrLeft = layout.qr.x;
    const qrRight = qrLeft + layout.qr.size;

    expect(qrTop).toBeGreaterThanOrEqual(layout.panel.y);
    expect(qrBottom).toBeLessThanOrEqual(layout.panel.y + layout.panel.height);
    expect(qrRight).toBeLessThanOrEqual(layout.panel.x + layout.panel.width);
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
    expect(layout.pills.y).toBeGreaterThan(
      layout.headline.y + layout.headline.fontSize / 2,
    );
    expect(layout.stats.dividerY1).toBeGreaterThan(
      layout.pills.y + layout.pills.height,
    );
    expect(layout.panel.y).toBeGreaterThan(layout.stats.dividerY2);
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

describe("selectBestTalentStats", () => {
  it("shows current RootScore, response rate, rating and shortlist data", async () => {
    const { selectBestTalentStats } = await import("@/lib/share-card");
    const stats = selectBestTalentStats({
      profile: {
        trust_score: 84.6,
        response_rate: 92,
        analytics: { shortlist_count: 7 },
      },
      testimonials: [{ rating: 4 }, { rating: 5 }],
    });

    expect(stats.length).toBe(4);
    expect(stats.map((stat) => stat.label)).toEqual([
      "RootScore",
      "Response Rate",
      "Rating",
      "Shortlists",
    ]);
    expect(stats.map((stat) => stat.count)).toEqual(["85", "92%", "4.5", "7"]);
    expect(stats.map((stat) => stat.note)).toEqual([
      "Excellent",
      "Very Responsive",
      "2 Reviews",
      "Saved by recruiters",
    ]);
  });

  it("shows explicit empty states when profile stats are missing", async () => {
    const { selectBestTalentStats } = await import("@/lib/share-card");
    const stats = selectBestTalentStats({});
    expect(stats.length).toBe(4);
    expect(stats.map((s) => s.label)).toEqual([
      "RootScore",
      "Response Rate",
      "Rating",
      "Shortlists",
    ]);
    expect(stats.map((stat) => stat.count)).toEqual(["—", "—", "—", "—"]);
    expect(stats.map((stat) => stat.note)).toEqual([
      "Not scored",
      "Not shared",
      "No reviews",
      "None yet",
    ]);
  });

  it("updates the displayed profile metrics when the source data changes", async () => {
    const { selectBestTalentStats } = await import("@/lib/share-card");
    const stats = selectBestTalentStats({
      profile: {
        trust_score: 40,
        response_rate: 0,
        analytics: { shortlist_count: 0 },
      },
      testimonials: [],
    });

    expect(stats.map((stat) => stat.count)).toEqual(["40", "0%", "—", "—"]);
    expect(stats.map((stat) => stat.note)).toEqual([
      "Average",
      "Responsive",
      "No reviews",
      "None yet",
    ]);
  });
});
