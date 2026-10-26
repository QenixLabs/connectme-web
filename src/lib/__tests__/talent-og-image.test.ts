import { randomFillSync } from "node:crypto";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_MAX_BYTES,
  OG_IMAGE_WIDTH,
} from "@/lib/og-image";
import { renderTalentOgImage } from "@/lib/server/talent-og-image";

describe("renderTalentOgImage", () => {
  it("renders an exact 1200x630 JPEG below the size limit for a portrait photo", async () => {
    const source = await sharp({
      create: {
        width: 900,
        height: 1400,
        channels: 3,
        background: "#4b2dc7",
      },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    const output = await renderTalentOgImage(source);
    const metadata = await sharp(output).metadata();

    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(OG_IMAGE_WIDTH);
    expect(metadata.height).toBe(OG_IMAGE_HEIGHT);
    expect(output.byteLength).toBeLessThan(OG_IMAGE_MAX_BYTES);
  });

  it("compresses high-entropy photos below the limit without changing dimensions", async () => {
    const width = 2400;
    const height = 1600;
    const pixels = Buffer.alloc(width * height * 3);
    randomFillSync(pixels);

    const source = await sharp(pixels, {
      raw: { width, height, channels: 3 },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    const output = await renderTalentOgImage(source);
    const metadata = await sharp(output).metadata();

    expect(metadata.width).toBe(OG_IMAGE_WIDTH);
    expect(metadata.height).toBe(OG_IMAGE_HEIGHT);
    expect(output.byteLength).toBeLessThan(OG_IMAGE_MAX_BYTES);
  });
});
