import { describe, expect, it } from "vitest";
import type { Testimonial } from "@/lib/api/talent";
import { computeRating } from "./data";

const testimonial = (rating?: number): Testimonial => ({
  _id: "review-id",
  user_id: "talent-id",
  type: "testimonial",
  author_name: "Reviewer",
  created_at: "2026-01-01T00:00:00.000Z",
  ...(rating === undefined ? {} : { rating }),
});

describe("computeRating", () => {
  it("averages only valid numeric ratings", () => {
    expect(
      computeRating([
        testimonial(4),
        testimonial(5),
        testimonial(),
        testimonial(0),
        testimonial(6),
      ]),
    ).toEqual({ average: 4.5, count: 2 });
  });

  it("returns no rating when there are no rated testimonials", () => {
    expect(computeRating([testimonial()])).toEqual({ average: 0, count: 0 });
  });
});
